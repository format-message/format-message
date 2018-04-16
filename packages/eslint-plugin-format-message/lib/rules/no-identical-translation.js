'use strict'

var getSettings = require('../util/get-settings')
var visitEachTranslation = require('../util/visit-each-translation')

function hasTextPart (element) {
  var children = element[3] || element[2]
  return (
    typeof element === 'string' || (
      typeof children === 'object' &&
      Object.keys(children).some(function (key) {
        return children[key].some(hasTextPart)
      })
    )
  )
}

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    var settings = getSettings(context)
    var baseSourceLocale = (settings.sourceLocale || 'en').split('-')[0].toLowerCase()

    return visitEachTranslation(context, function (info) {
      var id = info.id
      var node = info.node
      var locale = info.locale
      var pattern = info.pattern
      var translation = info.translation

      var baseLocale = locale.split('-')[0].toLowerCase()
      if (translation === pattern && baseSourceLocale !== baseLocale && info.patternAst) {
        var hasTextParts = info.patternAst.some(hasTextPart)
        if (hasTextParts) {
          context.report(node, 'Translation for "' + id + '" in "' + locale + '" is identical to original')
        }
      }
    })
  }
}
