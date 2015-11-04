/* globals Intl */
'use strict'

var assign = require('object-assign')
var MessageFormat = require('message-format')
var lookupClosestLocale = require('message-format/lib/lookup-closest-locale')

var formats = MessageFormat.data.formats
var number = formats.number
var date = formats.date
var time = formats.time
var cache = {}

var currentLocale = 'en'
var translations = null
var generateId = function (pattern) { return pattern }
var missingReplacement = null
var missingTranslation = 'warning'

module.exports = formatMessage
function formatMessage (msg, args, locale) {
  msg = typeof msg === 'string' ? { default: msg } : msg
  locale = locale || currentLocale
  var pattern = msg.default
  var id = msg.id || generateId(pattern)
  var key = 'format:' + id + ':' + locale
  var format = cache[key] ||
    (cache[key] = new MessageFormat(translate(id, pattern, locale), locale).format)
  return format(args)
}

function translate (id, pattern, locale) {
  var translated
  if (translations) {
    locale = lookupClosestLocale(locale, translations)
    translated = translations[locale] && translations[locale][id]
    if (translated && translated.message) translated = translated.message
    if (translated != null) return translated
  }

  var replacement = missingReplacement || pattern
  var message = 'no ' + locale + ' translation found for ' + id

  if (missingTranslation === 'ignore') {
    // do nothing
  } else if (missingTranslation === 'warning') {
    if (typeof console !== 'undefined') console.warn('Warning: ' + message)
  } else { // 'error'
    throw new Error(message)
  }

  return replacement
}

formatMessage.setup = function setup (opt) {
  opt = opt || {}
  if (opt.locale) currentLocale = opt.locale
  if (opt.translations) translations = opt.translations
  if (opt.generateId) generateId = opt.generateId
  if ('missingReplacement' in opt) missingReplacement = opt.missingReplacement
  if (opt.missingTranslation) missingTranslation = opt.missingTranslation
  if (opt.formats) {
    if (opt.formats.number) assign(number, opt.formats.number)
    if (opt.formats.date) assign(date, opt.formats.date)
    if (opt.formats.time) assign(time, opt.formats.time)
  }
}

var numberDefault = {}
formatMessage.number = function (locale, value, style) {
  var options = number[style] || numberDefault
  if (typeof Intl === 'undefined') {
    return Number(value).toLocaleString(locale, options)
  }
  var cache = options.cache || (options.cache = {})
  var format = cache[locale] ||
    (cache[locale] = new Intl.NumberFormat(locale, options).format)
  return format(value)
}

formatMessage.date = function (locale, value, style) {
  var options = date[style] || date.medium
  if (typeof Intl === 'undefined') {
    return new Date(value).toLocaleDateString(locale, options)
  }
  var cache = options.cache || (options.cache = {})
  var format = cache[locale] ||
    (cache[locale] = new Intl.DateTimeFormat(locale, options).format)
  return format(value)
}

formatMessage.time = function (locale, value, style) {
  var options = time[style] || time.medium
  if (typeof Intl === 'undefined') {
    return new Date(value).toLocaleTimeString(locale, options)
  }
  var cache = options.cache || (options.cache = {})
  var format = cache[locale] ||
    (cache[locale] = new Intl.DateTimeFormat(locale, options).format)
  return format(value)
}
