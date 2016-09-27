'use strict'

var util = require('format-message-estree-util')
var visitFormatCall = require('../util/visit-format-call')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitFormatCall(context, function (node) {
      var message = util.getMessageDetails(node.arguments)
      if (!message.default) {
        context.report(node.arguments[0] || node, 'Pattern is not a string literal')
      }
    })
  }
}
