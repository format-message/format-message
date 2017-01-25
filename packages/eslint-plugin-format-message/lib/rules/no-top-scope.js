'use strict'

var visitFormatCall = require('../util/visit-format-call')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitFormatCall(context, function (node) {
      var scope = context.getScope()
      var isTopScope = (
        scope.type === 'module' ||
        scope.type === 'global'
      )
      if (isTopScope) {
        context.report(node, 'Translation will never be re-evaluated if locale changes')
      }
    })
  }
}
