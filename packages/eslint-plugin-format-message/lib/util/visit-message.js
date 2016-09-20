'use strict'

var astUtil = require('./ast')
var jsxUtil = require('./jsx')

module.exports = function visitMessage (context, visitor) {
  return {
    'CallExpression': function (node) {
      if (astUtil.isFormatMessage(context, node.callee)) {
        visitor.apply(this, arguments)
      }
    },
    'JSXElement': function (node) {
      if (jsxUtil.isTranslatableElement(node)) {
        visitor.apply(this, arguments)
      }
    }
  }
}
