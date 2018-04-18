// @flow
'use strict'
const parse = require('format-message-parse')
const interpret = require('format-message-interpret')
const plurals = require('format-message-interpret/plurals')
const lookupClosestLocale = require('lookup-closest-locale')
const origFormats = require('format-message-formats')

/*::
import type { Types } from 'format-message-interpret'
type Locale = string
type Locales = Locale | Locale[]
type Message = string | {|
  id?: string,
  default: string,
  description?: string
|}
type Translations = { [string]: ?{ [string]: string | Translation } }
type Translation = {
  message: string,
  format?: (args?: Object) => string,
  toParts?: (args?: Object) => any[],
}
type Replacement = ?string | (string, string, locales?: Locales) => ?string
type Options = {
  locale?: Locales,
  translations?: ?Translations,
  generateId?: (string) => string,
  missingReplacement?: Replacement,
  missingTranslation?: 'ignore' | 'warning' | 'error',
  formats?: {
    number?: { [string]: * },
    date?: { [string]: * },
    time?: { [string]: * }
  },
  types?: Types
}
*/

function assign/*:: <T: Object> */ (target/*: T */, source/*: Object */) {
  Object.keys(source).forEach(function (key) { target[key] = source[key] })
  return target
}

function namespace () {
  const formats = assign({}, origFormats)
  let currentLocales/*: Locales */ = 'en'
  let translations/*: Translations */ = {}
  let generateId/*: (string) => string */ = function (pattern) { return pattern }
  let missingReplacement/*: Replacement */ = null
  let missingTranslation/*: 'ignore' | 'warning' | 'error' */ = 'warning'
  let types/*: Types */ = {}

  function formatMessage (msg/*: Message */, args/*:: ?: Object */, locales/*:: ?: Locales */) {
    const pattern = typeof msg === 'string' ? msg : msg.default
    const id = (typeof msg === 'object' && msg.id) || generateId(pattern)
    const translated = translate(pattern, id, locales || currentLocales)
    const format = translated.format || (
      translated.format = interpret(parse(translated.message), locales || currentLocales, types)
    )
    return format(args)
  }

  formatMessage.rich = function rich (msg/*: Message */, args/*:: ?: Object */, locales/*:: ?: Locales */) {
    const pattern = typeof msg === 'string' ? msg : msg.default
    const id = (typeof msg === 'object' && msg.id) || generateId(pattern)
    const translated = translate(pattern, id, locales || currentLocales)
    const format = translated.toParts || (
      translated.toParts = interpret.toParts(parse(pattern, { tagsType: tagsType }), locales || currentLocales, types)
    )
    return format(args)
  }

  const tagsType = '<>'
  function richType (node/*: any[] */, locales/*: Locales */) {
    const style = node[2]
    return function (fn, args) {
      const props = typeof style === 'object' ? mapObject(style, args) : style
      return typeof fn === 'function' ? fn(props) : fn
    }
  }
  types[tagsType] = richType

  function mapObject (object/* { [string]: (args?: Object) => any } */, args/*: ?Object */) {
    return Object.keys(object).reduce(function (mapped, key) {
      mapped[key] = object[key](args)
      return mapped
    }, {})
  }

  function translate (pattern/*: string */, id/*: string */, locales/*: Locales */)/*: Translation */ {
    const locale = lookupClosestLocale(locales, translations) || 'en'
    const messages = translations[locale] || (translations[locale] = {})
    let translated = messages[id]
    if (typeof translated === 'string') {
      translated = messages[id] = { message: translated }
    }
    if (!translated) {
      const message = 'Translation for "' + id + '" in "' + locale + '" is missing'
      if (missingTranslation === 'warning') {
        /* istanbul ignore else */
        if (typeof console !== 'undefined') console.warn(message)
      } else if (missingTranslation !== 'ignore') { // 'error'
        throw new Error(message)
      }
      const replacement = typeof missingReplacement === 'function'
        ? missingReplacement(pattern, id, locale) || pattern
        : missingReplacement || pattern
      translated = messages[id] = { message: replacement }
    }
    return translated
  }

  formatMessage.setup = function setup (opt/*: Options */) {
    opt = opt || {}
    if (opt.locale) currentLocales = opt.locale
    if ('translations' in opt) translations = opt.translations || {}
    if (opt.generateId) generateId = opt.generateId
    if ('missingReplacement' in opt) missingReplacement = opt.missingReplacement
    if (opt.missingTranslation) missingTranslation = opt.missingTranslation
    if (opt.formats) {
      if (opt.formats.number) assign(formats.number, opt.formats.number)
      if (opt.formats.date) assign(formats.date, opt.formats.date)
      if (opt.formats.time) assign(formats.time, opt.formats.time)
    }
    if (opt.types) {
      types = opt.types
      types[tagsType] = richType
    }
    return {
      locale: currentLocales,
      translations: translations,
      generateId: generateId,
      missingReplacement: missingReplacement,
      missingTranslation: missingTranslation,
      formats: formats,
      types: types
    }
  }

  formatMessage.number = function (value/*: number */, style/*:: ?: string */, locales/*:: ?: Locales */) {
    const options = (style && formats.number[style]) ||
      formats.parseNumberPattern(style) ||
      formats.number.default
    return value.toLocaleString(locales || currentLocales, options)
  }

  formatMessage.date = function (value/*: number | Date */, style/*:: ?: string */, locales/*:: ?: Locales */) {
    const options = (style && formats.date[style]) ||
      formats.parseDatePattern(style) ||
      formats.date.default
    return new Date(value).toLocaleDateString(locales || currentLocales, options)
  }

  formatMessage.time = function (value/*: number | Date */, style/*:: ?: string */, locales/*:: ?: Locales */) {
    const options = (style && formats.time[style]) ||
      formats.parseDatePattern(style) ||
      formats.time.default
    return new Date(value).toLocaleTimeString(locales || currentLocales, options)
  }

  formatMessage.select = function (value/*: any */, options/*: Object */) {
    return options[value] || options.other
  }

  formatMessage.custom = function (placeholder/*: any[] */, locales/*: Locales */, value/*: any */, args/*: Object */) {
    if (!(placeholder[1] in types)) return value
    return types[placeholder[1]](placeholder, locales)(value, args)
  }

  formatMessage.plural = plural.bind(null, 'cardinal')
  formatMessage.selectordinal = plural.bind(null, 'ordinal')
  function plural (
    pluralType/*: 'cardinal' | 'ordinal' */,
    value/*: number */,
    offset/*: any */,
    options/*: any */,
    locale/*: any */
  ) {
    if (typeof offset === 'object' && typeof options !== 'object') { // offset is optional
      locale = options
      options = offset
      offset = 0
    }
    const closest = lookupClosestLocale(locale || currentLocales, plurals)
    const plural = (closest && plurals[closest][pluralType]) || returnOther
    return options['=' + +value] || options[plural(value - offset)] || options.other
  }
  function returnOther (/*:: n:number */) { return 'other' }

  return formatMessage
}

module.exports = exports = namespace()
exports.namespace = namespace
