'use strict'

var jsxUtil = require('./jsx')

module.exports = function visitJSXMessage (context, visitor) {
  return {
    'JSXElement': function (node) {
      if (jsxUtil.isTranslatableElement(node)) {
        visitor.apply(this, arguments)
      }
    }
  }
}
