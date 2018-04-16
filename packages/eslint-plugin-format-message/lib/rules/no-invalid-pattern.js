'use strict'

var parse = require('format-message-parse')
var util = require('format-message-estree-util')
var visitFormatCall = require('../util/visit-format-call')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitFormatCall(context, function (node) {
      var message = util.getMessageDetails(node.arguments)
      if (!message.default) return // not a literal, handled elsewhere
      var isRich = util.isRichMessage(node.callee)

      try {
        parse(message.default, { tagsType: isRich ? '<>' : null })
      } catch (err) {
        context.report(node.arguments[0] || node, 'Pattern is invalid: ' + err.message)
      }
    })
  }
}
