'use strict'

var formats = require('format-message-formats')

function objectToAst (t, object) {
  if (object === undefined) return t.identifier('undefined')
  if (object === null) return t.nullLiteral()
  if (typeof object === 'boolean') return t.booleanLiteral(object)
  if (typeof object === 'number') return t.numericLiteral(object)
  if (typeof object === 'string') return t.stringLiteral(object)
  if (Array.isArray(object)) {
    return t.arrayExpression(object.map(function (value) {
      return objectToAst(t, value)
    }))
  }
  return t.objectExpression(Object.keys(object).map(function (key) {
    var validId = /^[a-z_$][a-z0-9_$]*$/.test(key)
    return t.objectProperty(
      validId ? t.identifier(key) : t.stringLiteral(key),
      objectToAst(t, object[key])
    )
  }))
}

exports.addHelper = function (state, type, style, locale) {
  style = style || 'default'
  var id = [ style, locale, type ].join('_')
  var helpers = state.path.hub.file.formatMessageHelpers || (
    state.path.hub.file.formatMessageHelpers = {}
  )
  if (helpers[id]) return helpers[id]

  var options = formats[type][style] ||
    (style && (type === 'number'
      ? formats.parseNumberPattern(style)
      : formats.parseDatePattern(style)
    )) || formats[type].default
  var constructor = type === 'number' ? 'NumberFormat' : 'DateTimeFormat'
  var t = state.t
  var init = t.memberExpression(
    t.callExpression(
      t.memberExpression(
        t.identifier('Intl'),
        t.identifier(constructor)
      ),
      [ t.stringLiteral(locale), objectToAst(t, options) ]
    ),
    t.identifier('format')
  )
  init._compact = true

  var programScope = state.path.scope.getProgramParent()
  var uid = programScope.generateUidIdentifier(id)
  programScope.push({
    id: uid,
    init: init
  })
  return (helpers[id] = uid)
}
