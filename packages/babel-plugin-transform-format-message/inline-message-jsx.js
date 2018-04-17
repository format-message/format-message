'use strict'

var parse = require('format-message-parse')
var formats = require('format-message-formats')
var addHelper = require('./inline-helpers').addHelper

module.exports = function inlineMessageJSX (state) {
  return transformSub(state, parse(state.pattern, { tagsType: '<>' }))
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
    if (children.length === 1) return children[0]
    if (children.length === 0) return t.stringLiteral('')
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
    case '<>':
      return transformTag(state, id, style)
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
  if (!style || formats.number[style]) {
    var callee = addHelper(state, 'number', style, state.locale)
    return t.callExpression(callee, [ value ])
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
  if (!style || formats[type][style]) {
    var callee = addHelper(state, type, style, state.locale)
    return t.callExpression(callee, [ transformArgument(state, id) ])
  }
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

function transformTag (state, id, props) {
  var t = state.t
  var wrapper = state.wrappers[id].node
  if (!props) return wrapper
  return t.jSXElement(
    wrapper.openingElement,
    wrapper.closingElement,
    typeof props === 'string'
      ? [ t.stringLiteral(props) ]
      : transformSub(state, props.children)
  )
}

function transformArgument (state, id) {
  return state.parameters[id]
}
