'use strict'

var util = require('format-message-estree-util')

module.exports = function visitFormatCall (context, visitor) {
  return {
    'CallExpression': function (node) {
      util.setESLintContext(context)
      if (util.isFormatMessage(node.callee) || util.isRichMessage(node.callee)) {
        visitor.apply(this, arguments)
      }
    }
  }
}
