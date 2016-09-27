'use strict'

var util = require('format-message-estree-util')
var visitJSXMessage = require('../util/visit-jsx-message')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitJSXMessage(context, function (node) {
      var message = util.getElementMessageDetails(node)
      if (!message.default) {
        context.report(node, 'JSX element has nothing to translate')
      }
    })
  }
}
