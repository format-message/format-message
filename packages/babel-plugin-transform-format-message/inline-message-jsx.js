'use strict'

var baseFormatChildren = require('format-message/base-format-children')
var parse = require('format-message-parse')

var formatChildren = baseFormatChildren.bind(null, function (element, children) {
  if (!children) return '{ ' + element + ' }'
  return '{ ' + element + ', select, other {' + children.join('') + '} }'
})

module.exports = function inlineMessageJSX (state) {
  // insert wrappers as selects
  var wrappers = Object.keys(state.wrappers).reduce(function (object, key) {
    object[key] = '$$' + key
    return object
  }, {})

  var pattern = formatChildren(state.pattern, wrappers)
  if (Array.isArray(pattern)) pattern = pattern.join('')

  return transformSub(state, parse(pattern))
}

function transformSub (state, elements, parent) {
  var t = state.t
  var children = elements.map(function (element) {
    if (typeof element === 'string') {
      return parent ? t.stringLiteral(element) : t.jSXText(element)
    }
    var child = transformElement(state, element, parent)
    return (parent || child.type === 'JSXElement')
      ? child : t.jSXExpressionContainer(child)
  })
  if (parent) {
    if (children.length === 1) children = children[0]
    if (children.length === 0) children = t.stringLiteral('')
  }
  return children
}

function transformElement (state, element, parent) {
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
    value,
    t.stringLiteral(style || ''),
    t.stringLiteral(state.locale)
  ]
  var numberHelper = state.helper('number')
  return t.callExpression(numberHelper, args)
}

function transformDateTime (state, id, type, style) {
  var t = state.t
  var args = [
    transformArgument(state, id),
    t.stringLiteral(style || ''),
    t.stringLiteral(state.locale)
  ]
  var helper = state.helper(type)
  return t.callExpression(helper, args)
}

function transformPlural (state, id, type, offset, children) {
  var t = state.t
  var parent = [ id, type, offset ]
  var args = [
    transformArgument(state, id),
    t.numericLiteral(offset),
    t.objectExpression(Object.keys(children).map(function (key) {
      return t.objectProperty(
        t.stringLiteral(key),
        transformSub(state, children[key], parent)
      )
    })),
    t.stringLiteral(state.locale)
  ]
  var helper = state.helper(type)
  return t.callExpression(helper, args)
}

function transformSelect (state, id, children) {
  var t = state.t

  // special case for handling wrappers
  if (id.slice(0, 2) === '$$' && state.wrappers[id.slice(2)]) {
    var wrapper = state.wrappers[id.slice(2)].node
    return t.jSXElement(
      wrapper.openingElement,
      wrapper.closingElement,
      transformSub(state, children.other)
    )
  }

  var parent = [ id, 'select' ]
  var s = state.sId ||
    (state.sId = state.path.scope.generateDeclaredUidIdentifier('s'))
  var other = t.stringLiteral('')
  var conditions = []
  Object.keys(children).forEach(function (key) {
    if (key === 'other') {
      other = transformSub(state, children[key], parent)
      return
    }
    conditions.push({
      test: t.binaryExpression('===', s, t.stringLiteral(key)),
      expr: transformSub(state, children[key], parent)
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
  // special case elements
  if (id.slice(0, 2) === '$$' && state.wrappers[id.slice(2)]) {
    return state.wrappers[id.slice(2)].node
  }
  return state.parameters[id]
}
