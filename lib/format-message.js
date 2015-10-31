/* global Intl:false */
'use strict'

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
var missingTranslation = 'error'

function cacheable (key, fn) {
  if (!enableCache) return fn()
  if (!(key in cache)) cache[key] = fn()
  return cache[key]
}

module.exports = formatMessage
function formatMessage (pattern, args, locale) {
  locale = locale || currentLocale
  return cacheable(locale + ':format:' + pattern, function () {
    return new MessageFormat(
      translate(pattern, locale),
      locale,
      { cache: enableCache }
    ).format
  })(args)
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
}

formatMessage.number = function (locale, value, style) {
  style = style || 'medium'
  return cacheable(locale + ':number:' + style, function () {
    return (typeof Intl !== 'undefined' && Intl.NumberFormat)
      ? new Intl.NumberFormat(locale, number[style]).format
      : function (arg) {
        return Number(arg).toLocaleString(locale, number[style])
      }
  })(value)
}

formatMessage.date = function (locale, value, style) {
  style = style || 'medium'
  return cacheable(locale + ':date:' + style, function () {
    return (typeof Intl !== 'undefined' && Intl.DateTimeFormat)
      ? new Intl.DateTimeFormat(locale, date[style]).format
      : function (arg) {
        return new Date(arg).toLocaleDateString(locale, date[style])
      }
  })(value)
}

formatMessage.time = function (locale, value, style) {
  style = style || 'medium'
  return cacheable(locale + ':time:' + style, function () {
    return (typeof Intl !== 'undefined' && Intl.DateTimeFormat)
      ? new Intl.DateTimeFormat(locale, time[style]).format
      : function (arg) {
        return new Date(arg).toLocaleTimeString(locale, time[style])
      }
  })(value)
}
