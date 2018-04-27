'use strict'
var lookupClosestLocale = require('lookup-closest-locale')
var parse = require('format-message-parse')
var visitEachTranslation = require('../util/visit-each-translation')
var locales = require('../../cldr.json').locales

function getPluralKeywords (ast) {
  var keywords = { cardinal: new Set(), ordinal: new Set() }
  function search (element) {
    if (!Array.isArray(element)) return
    var children = element[3] || element[2]
    if (typeof children !== 'object') return
    var type = element[1]
    Object.keys(children).forEach(key => {
      if (type === 'selectordinal') keywords.ordinal.add(key)
      else if (type === 'plural') keywords.cardinal.add(key)
      children[key].forEach(search)
    })
  }
  ast.forEach(search)
  return keywords
}

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    var settings = context.settings['format-message'] || {}
    var sourceLocale = settings.sourceLocale || 'en'
    var visitedNodes = new Set()
    return visitEachTranslation(context, function ({ id, node, patternAst, locale, translation }) {
      if (!visitedNodes.has(node) && patternAst) {
        visitedNodes.add(node)
        var { cardinal, ordinal } = getPluralKeywords(patternAst)
        var closest = lookupClosestLocale(sourceLocale, locales)
        var rules = closest && locales[closest] && locales[closest].plurals
        cardinal.forEach(rule => {
          if (!rules || rule === 'other' || rule[0] === '=') return
          if (rules.cardinal && rules.cardinal[rule]) return
          context.report(node, sourceLocale + ' has no "' + rule + '" cardinal plural rule')
        })
        ordinal.forEach(rule => {
          if (!rules || rule === 'other' || rule[0] === '=') return
          if (rules.ordinal && rules.ordinal[rule]) return
          context.report(node, sourceLocale + ' has no "' + rule + '" ordinal plural rule')
        })
      }

      if (translation == null) return // missing translation is handled in another rule
      try {
        ({ cardinal, ordinal } = getPluralKeywords(parse(translation)))
        closest = lookupClosestLocale(locale, locales)
        rules = closest && locales[closest] && locales[closest].plurals
        cardinal.forEach(rule => {
          if (!rules || rule === 'other' || rule[0] === '=') return
          if (rules.cardinal && rules.cardinal[rule]) return
          context.report(node, locale + ' has no "' + rule + '" cardinal plural rule')
        })
        ordinal.forEach(rule => {
          if (!rules || rule === 'other' || rule[0] === '=') return
          if (rules.ordinal && rules.ordinal[rule]) return
          context.report(node, locale + ' has no "' + rule + '" ordinal plural rule')
        })
      } catch (err) {
        // invalid translation handled in another rule
      }
    })
  }
}
