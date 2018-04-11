// @flow
'use strict'
const formats = require('format-message-formats')
const lookupClosestLocale = require('lookup-closest-locale')
const plurals = require('./plurals')

/*::
import type {
  AST,
  SubMessages
} from '../format-message-parse'
type Locale = string
type Locales = Locale | Locale[]
type Placeholder = any[] // https://github.com/facebook/flow/issues/4050
type Type = (Locales, Placeholder) => (any, ?Object) => any
type Types = { [string]: Type }
*/

exports = module.exports = function interpret (
  locale/*: Locales */,
  ast/*: AST */,
  types/*:: ?: Types */
)/*: (args?: Object) => string */ {
  return interpretAST(locale, ast, null, types || {}, true)
}

exports.toParts = function toParts (
  locale/*: Locales */,
  ast/*: AST */,
  types/*:: ?: Types */
)/*: (args?: Object) => any[] */ {
  return interpretAST(locale, ast, null, types || {}, false)
}

function interpretAST (
  locale/*: Locales */,
  elements/*: any[] */,
  parent/*: ?Placeholder */,
  types/*: Types */,
  join/*: boolean */
)/*: Function */ {
  const parts = elements.map(function (element) {
    return interpretElement(locale, element, parent, types, join)
  })

  if (!join) {
    return function format (args) {
      return parts.reduce(function (parts, part) {
        return parts.concat(part(args))
      }, [])
    }
  }

  if (parts.length === 1) return parts[0]
  return function format (args) {
    let message = ''
    for (let e = 0, ee = parts.length; e < ee; ++e) {
      message += parts[e](args)
    }
    return message
  }
}

function interpretElement (
  locale/*: Locales */,
  element/*: Placeholder */,
  parent/*: ?Placeholder */,
  types/*: Types */,
  join/*: boolean */
)/*: Function */ {
  if (typeof element === 'string') {
    const value/*: string */ = element
    return function format () { return value }
  }

  if (parent && element[0] === '#') {
    const id = parent[0]
    const offset = parent[2]
    const formatter = (types.number || defaults.number)(locale, [ id, 'number' ])
    return function format (args) {
      return formatter(getArg(id, args) - offset, args)
    }
  }

  const id = element[0]
  const type = element[1]

  // pre-process children
  if (type === 'plural' || type === 'selectordinal') {
    const children = {}
    Object.keys(element[3]).forEach(function (key) {
      children[key] = interpretAST(locale, element[3][key], element, types, join)
    })
    element = [ element[0], element[1], element[2], children ]
  } else if (element[2] && typeof element[2] === 'object') {
    const children = {}
    Object.keys(element[2]).forEach(function (key) {
      children[key] = interpretAST(locale, element[2][key], element, types, join)
    })
    element = [ element[0], element[1], children ]
  }

  const getFrmt = type && (types[type] || defaults[type])
  if (getFrmt) {
    const frmt = getFrmt(locale, element)
    return function format (args) {
      return frmt(getArg(id, args), args)
    }
  }

  return join
    ? function format (args) { return String(getArg(id, args)) }
    : function format (args) { return getArg(id, args) }
}

function getArg (id/*: string */, args/*: ?Object */)/*: any */ {
  if (args && (id in args)) return args[id]
  const parts = id.split('.')
  let a = args
  for (let i = 0, ii = parts.length; a && i < ii; ++i) {
    a = a[parts[i]]
  }
  return a
}

function interpretNumber (locales/*: Locales */, element/*: Placeholder */) {
  const style = element[2]
  const options = formats.number[style] || formats.number.default
  return new Intl.NumberFormat(locales, options).format
}

function interpretDuration (locales/*: Locales */, element/*: Placeholder */) {
  const style = element[2]
  const options = formats.duration[style] || formats.duration.default
  const fs = new Intl.NumberFormat(locales, options.seconds).format
  const fm = new Intl.NumberFormat(locales, options.minutes).format
  const fh = new Intl.NumberFormat(locales, options.hours).format
  const sep = /^fi$|^fi-|^da/.test(String(locales)) ? '.' : ':'

  return function (s, args) {
    s = +s
    if (!isFinite(s)) return fs(s)
    const h = ~~(s / 60 / 60) // ~~ acts much like Math.trunc
    const m = ~~(s / 60 % 60) || (s < 0 ? -0.1 : 0) // preserve sign
    return (h ? (fh(h) + sep) : '') +
      fm(h ? Math.abs(m) : m) + sep +
      fs(Math.abs(s % 60))
  }
}

function interpretDateTime (locales/*: Locales */, element/*: Placeholder */) {
  const type = element[1]
  const style = element[2]
  const options = formats[type][style] || formats[type].default
  return new Intl.DateTimeFormat(locales, options).format
}

function interpretPlural (locales/*: Locales */, element/*: Placeholder */) {
  const type = element[1]
  const pluralType = type === 'selectordinal' ? 'ordinal' : 'cardinal'
  const offset = element[2]
  const children = element[3]
  let pluralRules
  if (Intl.PluralRules) {
    pluralRules = new Intl.PluralRules(locales, { type: pluralType })
  } else {
    const locale = lookupClosestLocale(locales, plurals)
    const select = plurals[locale][pluralType]
    if (!select) return children.other
    pluralRules = { select: select }
  }

  return function (value, args) {
    const clause =
      children['=' + +value] ||
      children[pluralRules.select(value - offset)] ||
      children.other
    return clause(args)
  }
}

function interpretSelect (locales/*: Locales */, element/*: Placeholder */) {
  const children = element[2]
  return function (value, args) {
    const clause = children[value] || children.other
    return clause(args)
  }
}

const defaults/*: Types */ = {
  number: interpretNumber,
  ordinal: interpretNumber, // TODO: support rbnf
  spellout: interpretNumber, // TODO: support rbnf
  duration: interpretDuration,
  date: interpretDateTime,
  time: interpretDateTime,
  plural: interpretPlural,
  selectordinal: interpretPlural,
  select: interpretSelect
}
exports.types = defaults
