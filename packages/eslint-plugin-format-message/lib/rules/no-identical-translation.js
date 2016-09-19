'use strict'

var parse = require('format-message-parse')
var getSettings = require('../util/get-settings')
var visitEachTranslation = require('../util/visit-each-translation')

var TYPE = 1
var SELECT_OPTIONS = 2
var PLURAL_OPTIONS = 3

function hasTextPart (element) {
  return (
    typeof element === 'string' ||
    element[TYPE] === 'select' &&
    Object.keys(element[SELECT_OPTIONS]).some(function (key) {
      return element[SELECT_OPTIONS][key].some(hasTextPart)
    }) ||
    (element[TYPE] === 'plural' || element[TYPE] === 'selectordinal') &&
    Object.keys(element[PLURAL_OPTIONS]).some(function (key) {
      return element[PLURAL_OPTIONS][key].some(hasTextPart)
    })
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
      if (translation === pattern && baseSourceLocale !== baseLocale) {
        var hasTextParts = parse(pattern).some(hasTextPart)
        if (hasTextParts) {
          context.report(node, 'Translation for "' + id + '" in "' + locale + '" is identical to original')
        }
      }
    })
  }
}
