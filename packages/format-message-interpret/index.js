// @flow
'use strict'
var formats = require('format-message-formats')
var lookupClosestLocale = require('lookup-closest-locale')
var plurals = require('./plurals')

/*::
import type {
  AST,
  SubMessages
} from '../format-message-parse'
type Locale = string
type Locales = Locale | Locale[]
type Placeholder = any[] // https://github.com/facebook/flow/issues/4050
export type Type = (Placeholder, Locales) => (any, ?Object) => any
export type Types = { [string]: Type }
*/

exports = module.exports = function interpret (
  ast/*: AST */,
  locale/*:: ?: Locales */,
  types/*:: ?: Types */
)/*: (args?: Object) => string */ {
  return interpretAST(ast, null, locale || 'en', types || {}, true)
}

exports.toParts = function toParts (
  ast/*: AST */,
  locale/*:: ?: Locales */,
  types/*:: ?: Types */
)/*: (args?: Object) => any[] */ {
  return interpretAST(ast, null, locale || 'en', types || {}, false)
}

function interpretAST (
  elements/*: any[] */,
  parent/*: ?Placeholder */,
  locale/*: Locales */,
  types/*: Types */,
  join/*: boolean */
)/*: Function */ {
  var parts = elements.map(function (element) {
    return interpretElement(element, parent, locale, types, join)
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
    var message = ''
    for (var e = 0; e < parts.length; ++e) {
      message += parts[e](args)
    }
    return message
  }
}

function interpretElement (
  element/*: Placeholder */,
  parent/*: ?Placeholder */,
  locale/*: Locales */,
  types/*: Types */,
  join/*: boolean */
)/*: Function */ {
  if (typeof element === 'string') {
    var value/*: string */ = element
    return function format () { return value }
  }

  var id = element[0]
  var type = element[1]

  if (parent && element[0] === '#') {
    id = parent[0]
    var offset = parent[2]
    var formatter = (types.number || defaults.number)([ id, 'number' ], locale)
    return function format (args) {
      return formatter(getArg(id, args) - offset, args)
    }
  }

  // pre-process children
  var children
  if (type === 'plural' || type === 'selectordinal') {
    children = {}
    Object.keys(element[3]).forEach(function (key) {
      children[key] = interpretAST(element[3][key], element, locale, types, join)
    })
    element = [ element[0], element[1], element[2], children ]
  } else if (element[2] && typeof element[2] === 'object') {
    children = {}
    Object.keys(element[2]).forEach(function (key) {
      children[key] = interpretAST(element[2][key], element, locale, types, join)
    })
    element = [ element[0], element[1], children ]
  }

  var getFrmt = type && (types[type] || defaults[type])
  if (getFrmt) {
    var frmt = getFrmt(element, locale)
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
  var parts = id.split('.')
  var a = args
  for (var i = 0, ii = parts.length; a && i < ii; ++i) {
    a = a[parts[i]]
  }
  return a
}

function interpretNumber (element/*: Placeholder */, locales/*: Locales */) {
  var style = element[2]
  var options = formats.number[style] || formats.parseNumberPattern(style) || formats.number.default
  return new Intl.NumberFormat(locales, options).format
}

function interpretDuration (element/*: Placeholder */, locales/*: Locales */) {
  var style = element[2]
  var options = formats.duration[style] || formats.duration.default
  var fs = new Intl.NumberFormat(locales, options.seconds).format
  var fm = new Intl.NumberFormat(locales, options.minutes).format
  var fh = new Intl.NumberFormat(locales, options.hours).format
  var sep = /^fi$|^fi-|^da/.test(String(locales)) ? '.' : ':'

  return function (s, args) {
    s = +s
    if (!isFinite(s)) return fs(s)
    var h = ~~(s / 60 / 60) // ~~ acts much like Math.trunc
    var m = ~~(s / 60 % 60)
    var dur = (h ? (fh(Math.abs(h)) + sep) : '') +
      fm(Math.abs(m)) + sep + fs(Math.abs(s % 60))
    return s < 0 ? fh(-1).replace(fh(1), dur) : dur
  }
}

function interpretDateTime (element/*: Placeholder */, locales/*: Locales */) {
  var type = element[1]
  var style = element[2]
  var options = formats[type][style] || formats.parseDatePattern(style) || formats[type].default
  return new Intl.DateTimeFormat(locales, options).format
}

function interpretPlural (element/*: Placeholder */, locales/*: Locales */) {
  var type = element[1]
  var pluralType = type === 'selectordinal' ? 'ordinal' : 'cardinal'
  var offset = element[2]
  var children = element[3]
  var pluralRules
  if (Intl.PluralRules && Intl.PluralRules.supportedLocalesOf(locales).length > 0) {
    pluralRules = new Intl.PluralRules(locales, { type: pluralType })
  } else {
    var locale = lookupClosestLocale(locales, plurals)
    var select = (locale && plurals[locale][pluralType]) || returnOther
    pluralRules = { select: select }
  }

  return function (value, args) {
    var clause =
      children['=' + +value] ||
      children[pluralRules.select(value - offset)] ||
      children.other
    return clause(args)
  }
}

function returnOther (/*:: n:number */) { return 'other' }

function interpretSelect (element/*: Placeholder */, locales/*: Locales */) {
  var children = element[2]
  return function (value, args) {
    var clause = children[value] || children.other
    return clause(args)
  }
}

var defaults/*: Types */ = {
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
