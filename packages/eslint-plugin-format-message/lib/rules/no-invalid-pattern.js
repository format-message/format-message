'use strict'

var parse = require('format-message-parse')
var astUtil = require('../util/ast')
var visitFormatCall = require('../util/visit-format-call')

module.exports = function (context) {
  return visitFormatCall(context, function (node) {
    var message = astUtil.getMessageDetails(node.arguments)
    if (!message.default) return // not a literal, handled elsewhere

    try {
      parse(message.default)
    } catch (err) {
      context.report(node.arguments[0] || node, 'Pattern is invalid: ' + err.message)
    }
  })
}
