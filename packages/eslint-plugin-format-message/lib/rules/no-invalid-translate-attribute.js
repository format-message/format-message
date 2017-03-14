'use strict'

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return {
      'JSXElement': function (node) {
        var attributes = node.openingElement.attributes || []
        attributes.forEach(function (attribute) {
          var isTranslate = (
            attribute.name &&
            attribute.name.type === 'JSXIdentifier' &&
            attribute.name.name === 'translate'
          )
          if (!isTranslate) return
          var translate = attribute.value
          if (translate && translate.type !== 'Literal') return
          if (!translate || (translate.value !== 'yes' && translate.value !== 'no')) {
            context.report(attribute, 'Attribute translate should be "yes" or "no"')
          }
        })
      }
    }
  }
}
