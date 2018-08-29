'use strict'

var parse = require('@babel/parser').parse
var lookupClosestLocale = require('lookup-closest-locale')
var cldr = require('./cldr')
var addHelper = require('./inline-helpers').addHelper

var pluralVars = Object.keys(cldr.pluralVars).reduce(function (vars, key) {
  var keyId = key + 'Id'
  var keyAssign = key + 'Assign'
  vars[key] = function (state) {
    if (!state[keyId]) {
      state[keyId] = state.path.scope.generateDeclaredUidIdentifier(key)
    }
    if (!state[keyAssign]) {
      var init = cldr.pluralVars[key].replace(/\bs\b/g, state.sId.name)
      state[keyAssign] = state.t.assignmentExpression(
        '=',
        state[keyId],
        parse(init).program.body[0].expression
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
module.exports = function inlineMessage (locale, elements, tagsType, path, t) {
  var state = { t: t, locale: locale, path: path, tagsType: tagsType }

  if (!tagsType && elements.length === 1 && typeof elements[0] === 'string') {
    return t.stringLiteral(elements[0])
  } else if (elements.length === 0) {
    return t.stringLiteral('')
  }

  var paramsPath = path.get('arguments')[1]
  state.inlineParams = getInlineParams(paramsPath)
  var isParamsIdentifier = paramsPath && paramsPath.isIdentifier()
  if (!state.inlineParams && isParamsIdentifier) {
    state.paramsVarId = paramsPath.node
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
  return addToParams('', path, {})
}

function addToParams (prefix, path, params) {
  path.get('properties').forEach(function (prop) {
    var key = prop.node.key.name || prop.node.key.value
    params[prefix + key] = prop.node.value
    if (prop.get('value').isObjectExpression()) {
      addToParams(prefix + key + '.', prop.get('value'), params)
    }
  })
  return params
}

function canInlineParams (path) {
  return !!path && (
    path.isObjectExpression() &&
    path.get('properties').every(function (prop) {
      return (
        prop.isObjectProperty({ computed: false }) ||
        prop.get('key').isStringLiteral()
      ) && (
        !path.get('value').isObjectExpression() ||
        canInlineParams(path.get('value'))
      )
    })
  )
}

function transformSub (state, elements, parent) {
  var t = state.t
  if (elements.length === 0) {
    return t.stringLiteral('')
  }

  var parts = elements.map(function (element) {
    return transformElement(state, element, parent)
  })

  if (state.tagsType) return t.arrayExpression(parts)
  return parts.reduce(function (left, right) {
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
    case state.tagsType:
      return transformTag(state, id, style)
    default:
      if (type) return transformCustom(state, element)
      return transformArgument(state, id)
  }
}

function transformNumber (state, id, offset, style) {
  var t = state.t
  var value = transformArgument(state, id)
  if (offset) {
    value = t.binaryExpression('-', value, t.numericLiteral(offset))
  }
  var callee = addHelper(state, 'number', style, state.locale)
  return t.callExpression(callee, [ value ])
}

function transformDateTime (state, id, type, style) {
  var t = state.t
  var callee = addHelper(state, type, style, state.locale)
  return t.callExpression(callee, [ transformArgument(state, id) ])
}

function transformCustom (state, placeholder) {
  if (!state.paramsVarId) {
    state.paramsVarId = state.path.scope.generateDeclaredUidIdentifier('params')
  }
  var t = state.t
  return t.callExpression(
    t.memberExpression(
      state.path.node.callee,
      t.identifier('custom')
    ),
    [
      t.arrayExpression(placeholder.map(function (s) {
        return t.stringLiteral(s)
      })),
      t.stringLiteral(state.locale),
      transformArgument(state, placeholder[0]),
      state.paramsVarId
    ]
  )
}

function transformPlural (state, id, type, offset, children) {
  var t = state.t
  var scope = state.path.scope
  var parent = [ id, type, offset ]
  var closest = lookupClosestLocale(state.locale, cldr.locales)
  var ptype = type === 'selectordinal' ? 'ordinal' : 'cardinal'
  var conditions = (closest && cldr.locales[closest].plurals[ptype]) || {}
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
        .replace(/\b[ivbwftns]\b/g, function (varname) {
          if (varname !== 'n' && varname !== 's') {
            refs[varname] = pluralVars[varname](state)
          }
          return state[varname + 'Id'].name
        })
      test = parse(cond).program.body[0].expression
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
    (state.sId = state.path.scope.generateDeclaredUidIdentifier('s'))
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

function transformTag (state, id, props) {
  var t = state.t
  var arg = transformArgument(state, id)
  var params = []
  if (typeof props === 'object') {
    params.push(t.objectExpression(Object.keys(props).map(function (key) {
      return t.objectProperty(
        propertyKey(key, t),
        transformSub(state, props[key])
      )
    })))
  } else if (typeof props === 'string') {
    params.push(t.stringLiteral(props))
  }
  if (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') {
    return t.callExpression(arg, params)
  }

  var s = state.sId ||
    (state.sId = state.path.scope.generateDeclaredUidIdentifier('s'))
  return t.sequenceExpression([
    t.assignmentExpression('=', s, arg),
    t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.unaryExpression('typeof', s),
        t.stringLiteral('function')
      ),
      t.callExpression(s, params),
      s
    )
  ])
}

function transformArgument (state, id) {
  var t = state.t
  if (state.inlineParams) {
    return state.inlineParams[id] ||
      t.unaryExpression('void', t.numericLiteral(0), true)
  }

  if (!state.paramsVarId) {
    state.paramsVarId = state.path.scope.generateDeclaredUidIdentifier('params')
  }
  var lookup = makeMemberExpression(t, state.paramsVarId, id)
  var parts = id.split('.')
  if (parts.length <= 1) return lookup

  return t.conditionalExpression(
    t.binaryExpression('in', t.stringLiteral(id), state.paramsVarId),
    lookup,
    parts.reduce(function (object, key) {
      return makeMemberExpression(t, object, key)
    }, state.paramsVarId)
  )
}

var validId = /^[a-z_$][a-z0-9_$]*$/
function propertyKey (key, t) {
  return validId.test(key) ? t.identifier(key) : t.stringLiteral(key)
}

function makeMemberExpression (t, object, key) {
  var valid = validId.test(key)
  return t.memberExpression(
    object,
    valid ? t.identifier(key) : t.stringLiteral(key),
    !valid
  )
}
