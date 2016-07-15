'use strict'

var visitEachTranslation = require('../util/visit-each-translation')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitEachTranslation(context, function (info) {
      var id = info.id
      var node = info.node
      var locale = info.locale
      var translation = info.translation

      if (translation == null) {
        context.report(node, 'Translation for "' + id + '" in "' + locale + '" is missing')
      }
    })
  }
}
