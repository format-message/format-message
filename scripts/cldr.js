'use strict'

var writeFileSync = require('fs').writeFileSync
var pluralsJSON = require('cldr-core/supplemental/plurals.json')
var ordinalsJSON = require('cldr-core/supplemental/ordinals.json')

var pluralVars = {
  i: 'Math.floor(Math.abs(+s))',
  v: '(s + \'.\').split(\'.\')[1].length',
  w: '(\'\' + s).replace(/^[^.]*\.?|0+$/g, \'\').length',
  f: '+(s + \'.\').split(\'.\')[1]',
  t: '+(\'\' + s).replace(/^[^.]*\.?|0+$/g, \'\')',
  n: '+s'
}

var pluralFunctions = []

function parseRules (rules) {
  var clauses = []
  var data = {}
  var keyword
  var rule

  for (var key in rules) {
    if (key === 'pluralRule-count-other') { continue }
    keyword = key.replace('pluralRule-count-', '')
    rule = rules[key].replace(/\s*@.*$/, '')
    if (keyword !== 'other') clauses.push([ keyword, rule ])
  }
  if (!clauses.length) {
    return null
  }

  var fn = '    return '
  var refs = { i: false, v: false, w: false, f: false, t: false, n: false }

  for (var [ keyword, rule ] of clauses) {
    var condition = rule
      .replace(/\bor\b/g, '||')
      .replace(/\band\b/g, '&&')
      .replace(/(\w(?:\s*%\s*\d+)?)\s*=\s*((?:[0-9.]+,)+[0-9.]+)/g, ($0, exp, ranges) =>
        `(${ranges.split(',').map(range => `${exp} = ${range}`).join(' || ')})`
      )
      .replace(/(\w(?:\s*%\s*\d+)?)\s*!=\s*((?:[0-9.]+,)+[0-9.]+)/g, ($0, exp, ranges) =>
        `(${ranges.split(',').map(range => `${exp} != ${range}`).join(' && ')})`
      )
      .replace(/(\w(?:\s*%\s*\d+)?)\s*=\s*(\d+)\.\.(\d+)/g, '($2 <= $1 && $1 <= $3)')
      .replace(/(\w(?:\s*%\s*\d+)?)\s*!=\s*(\d+)\.\.(\d+)/g, '($1 < $2 || $3 < $1)')
      .replace(/\s=\s/g, ' === ')
      .replace(/\s!=\s/g, ' !== ')
      .replace(/^\(([^()]*)\)$/, '$1')
    data[keyword] = condition

    fn += condition + ' ? ' + keyword + '\n      : '

    Object.keys(refs).forEach(function (key) {
      refs[key] = refs[key] || condition.indexOf(key) >= 0
    })
  }

  var vars = Object.keys(refs)
    .filter(function (key) { return refs[key] })
    .map(function (key) {
      return refs[key] && key + ' = ' + pluralVars[key]
    })
  if (vars.length) fn = '    var ' + vars.join('\n    var ') + '\n' + fn

  fn = '  function (s/*: string | number */)/*: Rule */ {\n' + fn + 'other\n  }'
  var index = pluralFunctions.indexOf(fn)
  if (index < 0) {
    index = pluralFunctions.length
    pluralFunctions[index] = fn
  }

  return {
    data: data,
    func: index
  }
}

var pluralsTypeCardinal = pluralsJSON.supplemental['plurals-type-cardinal']
var pluralsTypeOrdinal = ordinalsJSON.supplemental['plurals-type-ordinal']
var locales = {}
var funcs = {}

for (var locale in pluralsTypeCardinal) {
  var cardinal = parseRules(pluralsTypeCardinal[locale])
  if (cardinal) {
    locales[locale] = { plurals: { cardinal: cardinal.data } }
    funcs[locale] = 'cardinal: f[' + cardinal.func + ']'
  }
}
for (var locale in pluralsTypeOrdinal) {
  var ordinal = parseRules(pluralsTypeOrdinal[locale])
  if (ordinal) {
    if (locales[locale]) {
      locales[locale].plurals.ordinal = ordinal.data
      funcs[locale] += ', ordinal: f[' + ordinal.func + ']'
    } else {
      locales[locale] = { plurals: { ordinal: ordinal.data } }
      funcs[locale] = 'ordinal: f[' + ordinal.func + ']'
    }
  }
}
var fileData = JSON.stringify({ pluralVars: pluralVars, locales: locales }, null, '  ')
writeFileSync(__dirname + '/../packages/babel-plugin-transform-format-message/cldr.json', fileData, 'utf8')
console.log('Wrote data to packages/babel-plugin-transform-format-message/cldr.json')
writeFileSync(__dirname + '/../packages/eslint-plugin-format-message/cldr.json', fileData, 'utf8')
console.log('Wrote data to packages/eslint-plugin-format-message/cldr.json')

var interpretFileData = '\/\/ @flow\n\'use strict\'\n\n' +
  '/*:: export type Rule = \'zero\' | \'one\' | \'two\' | \'few\' | \'many\' | \'other\' */\n' +
  'var zero = \'zero\', one = \'one\', two = \'two\', few = \'few\', many = \'many\', other = \'other\'\n' +
  'var f = [\n' + pluralFunctions.join(',\n') + '\n]\n\n' +
  'module.exports = {\n  ' +
    Object.keys(funcs).map(function (locale) {
      return (
        (/^\w+$/.test(locale) ? locale : "'" + locale + "'") +
        ': { ' + funcs[locale] + ' }'
      )
    }).join(',\n  ') +
  '\n}\n'
writeFileSync(__dirname + '/../packages/format-message-interpret/plurals.js', interpretFileData, 'utf8')
console.log('Wrote data to packages/format-message-interpret/plurals.js')
