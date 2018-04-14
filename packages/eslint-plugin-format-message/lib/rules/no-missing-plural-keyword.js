'use strict'
const parse = require('format-message-parse')
const visitEachTranslation = require('../util/visit-each-translation')
const locales = require('../../cldr.json').locales

function getPlurals (ast) {
  const plurals = []
  function search (element) {
    if (!Array.isArray(element)) return
    const children = element[3] || element[2]
    if (typeof children !== 'object') return
    const type = element[1]
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
    const settings = context.settings['format-message'] || {}
    const sourceLocale = settings.sourceLocale || 'en'
    const visitedNodes = new Set()
    return visitEachTranslation(context, function ({ id, node, patternAst, locale, translation }) {
      if (!visitedNodes.has(node) && patternAst) {
        visitedNodes.add(node)
        const rules = locales[sourceLocale] && locales[sourceLocale].plurals
        getPlurals(patternAst).forEach(({ id, type, keywords }) => {
          if (!rules || !rules[type]) return
          Object.keys(rules[type]).filter(key => !keywords[key]).forEach(rule => {
            context.report(node, 'Pattern is missing the "' + rule + '" sub-message for placeholder "' + id + '"')
          })
        })
      }

      if (translation == null) return // missing translation is handled in another rule
      try {
        const rules = locales[locale] && locales[locale].plurals
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
