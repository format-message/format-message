'use strict'

const writeFileSync = require('fs').writeFileSync
const pluralsJSON = require('cldr-core/supplemental/plurals.json')
const ordinalsJSON = require('cldr-core/supplemental/ordinals.json')

const pluralVars = {
  i: 'Math.floor(Math.abs(+s))',
  v: '(s + \'.\').split(\'.\')[1].length',
  w: '(\'\' + s).replace(/^[^.]*\.?|0+$/g, \'\').length',
  f: '+(s + \'.\').split(\'.\')[1]',
  t: '+(\'\' + s).replace(/^[^.]*\.?|0+$/g, \'\')',
  n: '+s'
}

const pluralFunctions = []

function parseRules (rules) {
  const clauses = []
  const data = {}
  let keyword
  let rule

  for (const key in rules) {
    if (key === 'pluralRule-count-other') { continue }
    keyword = key.replace('pluralRule-count-', '')
    rule = rules[key].replace(/\s*@.*$/, '')
    if (keyword !== 'other') clauses.push([ keyword, rule ])
  }
  if (!clauses.length) {
    return null
  }

  let fn = '    return '
  const refs = { i: false, v: false, w: false, f: false, t: false, n: false }

  for (const [ keyword, rule ] of clauses) {
    const condition = rule
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

  const vars = Object.keys(refs)
    .filter(function (key) { return refs[key] })
    .map(function (key) {
      return refs[key] && key + ' = ' + pluralVars[key]
    })
  if (vars.length) fn = '    const ' + vars.join('\n    const ') + '\n' + fn

  fn = '  function (s/*: string | number */)/*: Rule */ {\n' + fn + 'other\n  }'
  let index = pluralFunctions.indexOf(fn)
  if (index < 0) {
    index = pluralFunctions.length
    pluralFunctions[index] = fn
  }

  return {
    data: data,
    func: index
  }
}

const pluralsTypeCardinal = pluralsJSON.supplemental['plurals-type-cardinal']
const pluralsTypeOrdinal = ordinalsJSON.supplemental['plurals-type-ordinal']
const locales = {}
const funcs = {}

for (const locale in pluralsTypeCardinal) {
  const cardinal = parseRules(pluralsTypeCardinal[locale])
  if (cardinal) {
    locales[locale] = { plurals: { cardinal: cardinal.data } }
    funcs[locale] = 'cardinal: f[' + cardinal.func + ']'
  }
}
for (const locale in pluralsTypeOrdinal) {
  const ordinal = parseRules(pluralsTypeOrdinal[locale])
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
const fileData = JSON.stringify({ pluralVars: pluralVars, locales: locales }, null, '  ')
writeFileSync(__dirname + '/../packages/babel-plugin-transform-format-message/cldr.json', fileData, 'utf8')
console.log('Wrote data to packages/babel-plugin-transform-format-message/cldr.json')

const interpretFileData = '\/\/ @flow\n\'use strict\'\n\n' +
  '/*:: export type Rule = \'zero\' | \'one\' | \'two\' | \'few\' | \'many\' | \'other\' */\n' +
  'const zero = \'zero\', one = \'one\', two = \'two\', few = \'few\', many = \'many\', other = \'other\'\n' +
  'const f = [\n' + pluralFunctions.join(',\n') + '\n]\n\n' +
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
