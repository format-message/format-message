'use strict'

var astUtil = require('../util/ast')
var visitFormatCall = require('../util/visit-format-call')

module.exports = function (context) {
  return visitFormatCall(context, function (node) {
    var message = astUtil.getMessageDetails(node.arguments)
    if (!message.default) {
      context.report(node.arguments[0] || node, 'Pattern is not a string literal')
    }
  })
}

module.exports.schema = []
