'use strict'

var jsxUtil = require('../util/jsx')
var visitJSXMessage = require('../util/visit-jsx-message')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitJSXMessage(context, function (node) {
      var message = jsxUtil.getElementMessageDetails(context, node)
      if (!message.default) {
        context.report(node, 'JSX element has nothing to translate')
      }
    })
  }
}
