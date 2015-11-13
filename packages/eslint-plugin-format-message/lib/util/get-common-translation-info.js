'use strict'

var parse = require('format-message-parse')
var astUtil = require('./ast')
var cache = {}

module.exports = function getCommonTranslationInfo (node) {
  var message = astUtil.getMessageDetails(node.arguments)
  if (!message.default) return {}

  var pattern = message.default
  var info = cache[pattern]
  if (!info) {
    info = cache[pattern] = { pattern: pattern }
    try {
      info.patternAst = parse(pattern)
    } catch (err) {
      // ignore parse error here
    }
    if (info.patternAst) {
      info.patternParams = astUtil.getParamsFromPatternAst(info.patternAst)
    }
  }

  // if a literal locale is specified, only validate that locale
  var locale = astUtil.getTargetLocale(node.arguments)

  return {
    id: message.id,
    pattern: info.pattern,
    patternAst: info.patternAst,
    patternParams: info.patternParams,
    locale: locale
  }
}
