'use strict'

var parse = require('format-message-parse')
var util = require('format-message-estree-util')
var getParamsFromPatternAst = require('./get-params-from-pattern-ast')
var cache = {}

module.exports = function getCommonTranslationInfo (context, node) {
  if (node.type === 'CallExpression') return getInfoFromCallExpression(node)
  if (node.type === 'JSXElement') return getInfoFromJSXElement(context, node)
  return {}
}

function getInfoFromCallExpression (node) {
  var message = util.getMessageDetails(node.arguments)
  var locale = util.getTargetLocale(node.arguments)
  var isRich = util.isRichMessage(node.callee)
  return getInfo(message, locale, isRich)
}

function getInfoFromJSXElement (context, node) {
  var message = util.getElementMessageDetails(node)
  var locale = util.getTargetLocale(node)
  return getInfo(message, locale, true)
}

function getInfo (message, locale, isRich) {
  if (!message.default) return {}

  var pattern = message.default
  var info = cache[pattern]
  if (!info) {
    info = cache[pattern] = { pattern: pattern }
    try {
      info.patternAst = parse(pattern, { tagsType: isRich ? '<>' : null })
    } catch (err) {
      // ignore parse error here
    }
    if (info.patternAst) {
      info.patternParams = getParamsFromPatternAst(info.patternAst)
    }
  }

  return {
    id: message.id,
    pattern: info.pattern,
    patternAst: info.patternAst,
    patternParams: info.patternParams,
    locale: locale,
    wrappers: info.wrappers,
    isRich: isRich
  }
}
