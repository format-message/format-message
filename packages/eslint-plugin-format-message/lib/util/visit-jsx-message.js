'use strict'

var util = require('format-message-estree-util')

module.exports = function visitJSXMessage (context, visitor) {
  return {
    'JSXElement': function (node) {
      util.setESLintContext(context)
      if (util.isTranslatableElement(node)) {
        visitor.apply(this, arguments)
      }
    }
  }
}
