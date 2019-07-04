'use strict'

var parse = require('format-message-parse')
var getParamsFromPatternAst = require('../util/get-params-from-pattern-ast')
var visitEachTranslation = require('../util/visit-each-translation')
var richTextParams = require('../util/rich-text-params')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitEachTranslation(context, function (info) {
      if (!info.patternAst || !info.translation) return
      var id = info.id
      var node = info.node
      var locale = info.locale
      var patternParams = info.patternParams
      var translation = info.translation
      var isRich = info.isRich

      var translationAst
      try {
        translationAst = parse(translation, { tagsType: isRich ? '<>' : null })
      } catch (err) {
        return // error handled elsewhere
      }

      var translationParams = getParamsFromPatternAst(translationAst, isRich)
      patternParams.forEach(function (paramName) {
        if (translationParams.indexOf(paramName) < 0) {
          var paramType = richTextParams.isRichTextParam(paramName) ? 'rich text ' : ''
          context.report(
            (node.arguments && node.arguments[0]) || node,
            'Translation for "' + id + '" in "' + locale + '" is missing ' +
              paramType + '"' + paramName + '" placeholder'
          )
        }
      })
      translationParams.forEach(function (paramName) {
        if (patternParams.indexOf(paramName) < 0) {
          var paramType = richTextParams.isRichTextParam(paramName) ? 'rich text ' : ''
          context.report(
            (node.arguments && node.arguments[0]) || node,
            'Translation for "' + id + '" in "' + locale + '" has extra ' +
              paramType + '"' + paramName + '" placeholder'
          )
        }
      })
    })
  }
}
