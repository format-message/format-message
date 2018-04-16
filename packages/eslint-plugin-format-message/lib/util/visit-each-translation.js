'use strict'

var visitMessage = require('./visit-message')
var getSettings = require('./get-settings')
var getCommonTranslationInfo = require('./get-common-translation-info')

module.exports = function visitEachTranslation (context, visitor) {
  var settings = getSettings(context)
  var translations = settings.translations || {}

  return visitMessage(context, function (node) {
    var info = getCommonTranslationInfo(context, node)
    var pattern = info.pattern
    var patternAst = info.patternAst
    var patternParams = info.patternParams
    var locale = info.locale
    var id = info.id || settings.generateId(pattern)

    // if a literal locale is specified, only validate that locale
    var locales = locale ? [ locale ] : Object.keys(translations)
    locales.forEach(function (locale) {
      var translation = translations[locale] && translations[locale][id]
      if (translation && translation.message) translation = translation.message
      visitor({
        id: id,
        node: node,
        locale: locale,
        pattern: pattern,
        patternAst: patternAst,
        patternParams: patternParams,
        translation: translation,
        wrappers: info.wrappers,
        isRich: info.isRich
      })
    })
  })
}
