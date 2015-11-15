'use strict'

var babylon = require('babylon')
var lookupClosestLocale = require('lookup-closest-locale')
var cldr = require('./cldr')

var pluralVars = Object.keys(cldr.pluralVars).reduce(function (vars, key) {
  var keyId = key + 'Id'
  var keyAssign = key + 'Assign'
  vars[key] = function (state) {
    if (!state[keyId]) {
      state[keyId] = state.callPath.scope.generateDeclaredUidIdentifier(key)
    }
    if (!state[keyAssign]) {
      var init = cldr.pluralVars[key].replace(/\bs\b/g, state.sId.name)
      state[keyAssign] = state.t.assignmentExpression(
        '=',
        state[keyId],
        babylon.parse(init).program.body[0].expression
      )
    }
    return state[keyAssign]
  }
  return vars
}, {})

/**
 * Turns this:
 *  [ "You have ", [ "numBananas", "plural", 0, {
 *       "=0": [ "no bananas" ],
 *      "one": [ "a banana" ],
 *    "other": [ [ '#' ], " bananas" ]
 *  } ], " for sale." ]
 *
 * into ast of this:
 *  `(function(args, locale) {
 *    return "You have " + formatMessage.plural(locale, args["numBananas"], 0, {
 *      "=0": "no bananas",
 *      "one": "a banana",
 *      "other": function() {
 *        return args["numBananas"] + " bananas";
 *      }
 *    }) + " for sale.";
 *  })(args, "en")`
 **/
module.exports = function inlineMessage (locale, elements, callPath, t) {
  var state = { t: t, locale: locale, callPath: callPath }

  if (elements.length === 1 && typeof elements[0] === 'string') {
    return t.stringLiteral(elements[0])
  } else if (elements.length === 0) {
    return t.stringLiteral('')
  }

  var paramsPath = callPath.get('arguments')[1]
  state.inlineParams = getInlineParams(paramsPath)
  var isParamsIdentifier = paramsPath && paramsPath.isIdentifier()
  if (!state.inlineParams) {
    state.paramsVarId = isParamsIdentifier ? paramsPath.node
      : callPath.scope.generateDeclaredUidIdentifier('params')
  }

  var concatElements = transformSub(state, elements)

  if (state.inlineParams || !paramsPath || isParamsIdentifier) {
    return concatElements
  }

  return t.sequenceExpression([
    t.assignmentExpression('=', state.paramsVarId, paramsPath.node),
    concatElements
  ])
}

function getInlineParams (path) {
  if (!canInlineParams(path)) return false
  return path.get('properties').reduce(function (params, prop) {
    var key = prop.node.key.name || prop.node.key.value
    params[key] = prop.node.value
    return params
  }, {})
}

function canInlineParams (path) {
  return !!path && (
    path.isObjectExpression() &&
    path.get('properties').every(function (prop) {
      return (
        prop.isObjectProperty({ computed: false }) ||
        prop.get('key').isStringLiteral()
      )
    })
  )
}

function transformSub (state, elements, parent) {
  var t = state.t
  if (elements.length === 0) {
    return t.stringLiteral('')
  }

  return elements.map(function (element) {
    return transformElement(state, element, parent)
  }).reduce(function (left, right) {
    return t.binaryExpression('+', left, right)
  })
}

function transformElement (state, element, parent) {
  var t = state.t
  if (typeof element === 'string') {
    return t.stringLiteral(element)
  }

  var id = element[0]
  var type = element[1]
  var style = element[2]
  var offset = 0

  if (id === '#') {
    id = parent[0]
    type = 'number'
    offset = parent[2]
    style = null
  }

  switch (type) {
    case 'number':
    case 'ordinal': // TODO: rbnf
    case 'spellout': // TODO: rbnf
    case 'duration': // TODO: duration
      return transformNumber(state, id, offset, style)
    case 'date':
    case 'time':
      return transformDateTime(state, id, type, style)
    case 'plural':
    case 'selectordinal':
      offset = element[2]
      var options = element[3]
      return transformPlural(state, id, type, offset, options)
    case 'select':
      return transformSelect(state, id, style)
    default:
      return transformArgument(state, id)
  }
}

function transformNumber (state, id, offset, style) {
  var t = state.t
  var value = transformArgument(state, id)
  if (offset) {
    value = t.binaryExpression('-', value, t.numericLiteral(offset))
  }
  var args = [
    t.stringLiteral(state.locale),
    value
  ]
  if (style) {
    args.push(t.stringLiteral(style))
  }
  return t.callExpression(
    t.memberExpression(
      state.callPath.node.callee,
      t.identifier('number')
    ),
    args
  )
}

function transformDateTime (state, id, type, style) {
  var t = state.t
  var args = [
    t.stringLiteral(state.locale),
    transformArgument(state, id)
  ]
  if (style) {
    args.push(t.stringLiteral(style))
  }
  return t.callExpression(
    t.memberExpression(
      state.callPath.node.callee,
      t.identifier(type)
    ),
    args
  )
}

function transformPlural (state, id, type, offset, children) {
  var t = state.t
  var scope = state.callPath.scope
  var parent = [ id, type, offset ]
  var closest = lookupClosestLocale(state.locale, cldr.locales)
  var ptype = type === 'selectordinal' ? 'ordinal' : 'cardinal'
  var conditions = cldr.locales[closest].plurals[ptype]
  var s = state.sId ||
    (state.sId = scope.generateDeclaredUidIdentifier('s'))
  var n = state.nId ||
    (state.nId = scope.generateDeclaredUidIdentifier('n'))
  var other = t.stringLiteral('')
  var vars = [
    t.assignmentExpression(
      '=', s, transformArgument(state, id)
    ),
    t.assignmentExpression(
      '=', n, t.unaryExpression('+', s, true /* isPrefix */)
    )
  ]
  var pvars = []
  if (offset) {
    pvars.push(t.assignmentExpression(
      '=', n, t.assignmentExpression(
        '=', s, t.binaryExpression(
          '-',
          t.unaryExpression('+', s, true /* isPrefix */),
          t.numericLiteral(offset)
        )
      )
    ))
  }

  var refs = {}
  var exactConditions = []
  var keyConditions = []
  Object.keys(children).forEach(function (key) {
    var expr = transformSub(state, children[key], parent)
    var test
    if (key === 'other') {
      other = expr
    } else if (key.charAt(0) === '=') {
      test = t.binaryExpression('===', n, t.numericLiteral(+key.slice(1)))
      exactConditions.push({ test: test, expr: expr })
    } else if (key in conditions) {
      var cond = conditions[key]
      if (/\bi\b/.test(cond)) {
        refs.i = pluralVars.i(state)
        cond = cond.replace(/\bi\b/g, state.iId.name)
      }
      if (/\bv\b/.test(cond)) {
        refs.v = pluralVars.v(state)
        cond = cond.replace(/\bv\b/g, state.vId.name)
      }
      if (/\bw\b/.test(cond)) {
        refs.w = pluralVars.w(state)
        cond = cond.replace(/\bw\b/g, state.wId.name)
      }
      if (/\bf\b/.test(cond)) {
        refs.f = pluralVars.f(state)
        cond = cond.replace(/\bf\b/g, state.fId.name)
      }
      if (/\bt\b/.test(cond)) {
        refs.t = pluralVars.t(state)
        cond = cond.replace(/\bt\b/g, state.tId.name)
      }
      if (/\bn\b/.test(cond)) {
        cond = cond.replace(/\bn\b/g, state.nId.name)
      }
      if (/\bs\b/.test(cond)) {
        cond = cond.replace(/\bs\b/g, state.sId.name)
      }
      test = babylon.parse(cond).program.body[0].expression
      keyConditions.push({ test: test, expr: expr })
    }
  })

  if (!exactConditions.length && !keyConditions.length) {
    return other
  }

  Object.keys(refs).forEach(function (key) {
    pvars.push(refs[key])
  })

  return t.sequenceExpression(vars.concat([
    exactConditions.reduceRight(function (alt, o) {
      return t.conditionalExpression(o.test, o.expr, alt)
    }, t.sequenceExpression(pvars.concat([
      keyConditions.reduceRight(function (alt, o) {
        return t.conditionalExpression(o.test, o.expr, alt)
      }, other)
    ])))
  ]))
}

function transformSelect (state, id, children) {
  var t = state.t
  var s = state.sId ||
    (state.sId = state.callPath.scope.generateDeclaredUidIdentifier('s'))
  var other = t.stringLiteral('')
  var conditions = []
  Object.keys(children).forEach(function (key) {
    if (key === 'other') {
      other = transformSub(state, children[key])
      return
    }
    conditions.push({
      test: t.binaryExpression('===', s, t.stringLiteral(key)),
      expr: transformSub(state, children[key])
    })
  })

  if (!conditions.length) { return other }

  return t.sequenceExpression([
    t.assignmentExpression(
      '=', s, transformArgument(state, id)
    ),
    conditions.reduceRight(function (alt, o) {
      return t.conditionalExpression(o.test, o.expr, alt)
    }, other)
  ])
}

function transformArgument (state, id) {
  var t = state.t
  if (state.inlineParams) {
    return state.inlineParams[id] ||
      t.unaryExpression('void', t.numericLiteral(0), true)
  }
  var validId = /^[a-z_$][a-z0-9_$]*$/.test(id)
  return t.memberExpression(
    state.paramsVarId,
    validId ? t.identifier(id) : t.stringLiteral(id),
    !validId
  )
}
