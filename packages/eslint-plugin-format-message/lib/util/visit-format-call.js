'use strict'

var astUtil = require('./ast')

module.exports = function visitFormatCall (context, visitor) {
  return {
    'CallExpression': function (node) {
      if (astUtil.isFormatMessage(context, node.callee)) {
        visitor.apply(this, arguments)
      }
    }
  }
}
