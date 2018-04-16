'use strict'

var parse = require('format-message-parse')
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
        return // missing translation is handled in another rule
      }

      try {
        parse(translation, { tagsType: info.isRich ? '<>' : null })
      } catch (err) {
        context.report(node, 'Translation for "' + id + '" in "' + locale + '" is invalid: ' + err.message)
      }
    })
  }
}
