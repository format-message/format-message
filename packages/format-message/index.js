/* globals Intl */
'use strict'

var assign = require('object-assign')
var parse = require('format-message-parse')
var interpret = require('format-message-interpret')
var lookupClosestLocale = require('lookup-closest-locale')
var formats = require('format-message-formats')

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
  locale = locale || currentLocale
  var pattern = typeof msg === 'string' ? msg : msg.default
  var id = typeof msg === 'object' && msg.id || generateId(pattern)
  var key = locale + ':' + id
  var format = cache[key] ||
    (cache[key] = generateFormat(locale, pattern, id))
  if (typeof format === 'string') return format
  return format(args)
}

function generateFormat (locale, pattern, id) {
  pattern = translate(locale, pattern, id)
  return interpret(locale, parse(pattern))
}

function translate (locale, pattern, id) {
  if (!translations) return pattern

  locale = lookupClosestLocale(locale, translations)
  var translated = translations[locale] && translations[locale][id]
  if (translated && translated.message) translated = translated.message
  if (translated != null) return translated

  var replacement = missingReplacement || pattern
  var message = 'Translation for "' + id + '" in "' + locale + '" is missing'

  if (missingTranslation === 'ignore') {
    // do nothing
  } else if (missingTranslation === 'warning') {
    if (typeof console !== 'undefined') console.warn(message)
  } else { // 'error'
    throw new Error(message)
  }

  return replacement
}

formatMessage.setup = function setup (opt) {
  opt = opt || {}
  if (opt.locale) currentLocale = opt.locale
  if ('translations' in opt) translations = opt.translations
  if (opt.generateId) generateId = opt.generateId
  if ('missingReplacement' in opt) missingReplacement = opt.missingReplacement
  if (opt.missingTranslation) missingTranslation = opt.missingTranslation
  if (opt.formats) {
    if (opt.formats.number) assign(number, opt.formats.number)
    if (opt.formats.date) assign(date, opt.formats.date)
    if (opt.formats.time) assign(time, opt.formats.time)
  }
}

formatMessage.number = function (locale, value, style) {
  var options = number[style] || number.decimal
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
