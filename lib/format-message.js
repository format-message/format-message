/* global Intl:false */
'use strict'

var assign = require('object-assign')
var MessageFormat = require('message-format')

var formats = MessageFormat.data.formats
var number = formats.number
var date = formats.date
var time = formats.time
var cache = formats.cache

var enableCache = true
var currentLocale = 'en'
var currentTranslate = function (pattern) { return pattern }
var missingReplacement = null
var missingTranslation = 'warning'

module.exports = formatMessage
function formatMessage (pattern, args, locale) {
  locale = locale || currentLocale
  var key = locale + ':format:' + pattern
  var format = enableCache && cache[key] ||
    new MessageFormat(translate(pattern, locale), locale).format
  if (enableCache) cache[key] = format
  return format(args)
}

function translate (originalPattern, locale) {
  locale = locale || currentLocale
  var pattern = currentTranslate(originalPattern, locale)
  if (pattern != null) return pattern

  var replacement = missingReplacement || originalPattern
  var message = 'no ' + locale + ' translation found for ' +
    JSON.stringify(originalPattern)

  if (missingTranslation === 'ignore') {
    // do nothing
  } else if (missingTranslation === 'warning') {
    if (typeof console !== 'undefined') console.warn('Warning: ' + message)
  } else { // 'error'
    throw new Error(message)
  }

  return replacement
}
formatMessage.translate = translate

formatMessage.setup = function setup (opt) {
  opt = opt || {}
  if (typeof opt.cache === 'boolean') enableCache = opt.cache
  if (opt.locale) currentLocale = opt.locale
  if (opt.translate) currentTranslate = opt.translate
  if ('missingReplacement' in opt) missingReplacement = opt.missingReplacement
  if (opt.missingTranslation) missingTranslation = opt.missingTranslation
  if (opt.formats) {
    if (opt.formats.number) assign(number, opt.formats.number)
    if (opt.formats.date) assign(date, opt.formats.date)
    if (opt.formats.time) assign(time, opt.formats.time)
  }
}

formatMessage.number = function (locale, value, style) {
  var options = number[style] || number.medium
  if (!enableCache || typeof Intl === 'undefined') {
    return Number(value).toLocaleString(locale, options)
  }
  var key = locale + ':number:' + (number[style] ? style : 'medium')
  var format = cache[key] ||
    (cache[key] = new Intl.NumberFormat(locale, options).format)
  return format(value)
}

formatMessage.date = function (locale, value, style) {
  var options = date[style] || date.medium
  if (!enableCache || typeof Intl === 'undefined') {
    return new Date(value).toLocaleDateString(locale, options)
  }
  var key = locale + ':date:' + (date[style] ? style : 'medium')
  var format = cache[key] ||
    (cache[key] = new Intl.DateTimeFormat(locale, options).format)
  return format(value)
}

formatMessage.time = function (locale, value, style) {
  var options = time[style] || time.medium
  if (!enableCache || typeof Intl === 'undefined') {
    return new Date(value).toLocaleTimeString(locale, options)
  }
  var key = locale + ':time:' + (time[style] ? style : 'medium')
  var format = cache[key] ||
    (cache[key] = new Intl.DateTimeFormat(locale, options).format)
  return format(value)
}
