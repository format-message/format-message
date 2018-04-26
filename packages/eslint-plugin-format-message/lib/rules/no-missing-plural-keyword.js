'use strict'
var lookupClosestLocale = require('lookup-closest-locale')
var parse = require('format-message-parse')
var visitEachTranslation = require('../util/visit-each-translation')
var locales = require('../../cldr.json').locales

function getPlurals (ast) {
  var plurals = []
  function search (element) {
    if (!Array.isArray(element)) return
    var children = element[3] || element[2]
    if (typeof children !== 'object') return
    var type = element[1]
    if (type === 'selectordinal' || type === 'plural') {
      plurals.push({
        id: element[0],
        type: type === 'plural' ? 'cardinal' : 'ordinal',
        keywords: children
      })
    }
    Object.keys(children).forEach(key => {
      children[key].forEach(search)
    })
  }
  ast.forEach(search)
  return plurals
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
        var closest = lookupClosestLocale(sourceLocale, locales)
        var rules = closest && locales[closest] && locales[closest].plurals
        getPlurals(patternAst).forEach(({ id, type, keywords }) => {
          if (!rules || !rules[type]) return
          Object.keys(rules[type]).filter(key => !keywords[key]).forEach(rule => {
            context.report(node, 'Pattern is missing the "' + rule + '" sub-message for placeholder "' + id + '"')
          })
        })
      }

      if (translation == null) return // missing translation is handled in another rule
      try {
        closest = lookupClosestLocale(locale, locales)
        rules = closest && locales[closest] && locales[closest].plurals
        getPlurals(parse(translation)).forEach(({ id, type, keywords }) => {
          if (!rules || !rules[type]) return
          Object.keys(rules[type]).filter(key => !keywords[key]).forEach(rule => {
            context.report(node, 'Translation for ' + locale + ' is missing the "' + rule + '" sub-message for placeholder "' + id + '"')
          })
        })
      } catch (err) {
        // invalid translation handled in another rule
      }
    })
  }
}
