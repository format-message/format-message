'use strict'

var visitFormatCall = require('./visit-format-call')
var getSettings = require('./get-settings')
var getCommonTranslationInfo = require('./get-common-translation-info')

module.exports = function visitEachTranslation (context, visitor) {
  var settings = getSettings(context)
  var translations = settings.translations || {}

  return visitFormatCall(context, function (node) {
    var info = getCommonTranslationInfo(node)
    var pattern = info.pattern
    var patternAst = info.patternAst
    var patternParams = info.patternParams
    var locale = info.locale
    var id = info.id || settings.generateId(pattern)

    if (!patternAst) return

    // if a literal locale is specified, only validate that locale
    var locales = locale ? [ locale ] : Object.keys(translations)
    locales.forEach(function (locale) {
      var translation = translations[locale] && translations[locale][id]
      visitor({
        id: id,
        node: node,
        locale: locale,
        pattern: pattern,
        patternParams: patternParams,
        translation: translation
      })
    })
  })
}
