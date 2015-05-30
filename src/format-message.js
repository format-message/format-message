/*global Intl:false */
import MessageFormat from 'message-format'

const formats = MessageFormat.data.formats
const { number, date, time, cache } = formats

let enableCache = true
let currentLocale = 'en'
let currentTranslate = pattern => pattern
let missingReplacement = null
let missingTranslation = 'error'

function cacheable (key, fn) {
  if (!enableCache) return fn()
  if (!(key in cache)) cache[key] = fn()
  return cache[key]
}

export default function formatMessage (pattern, args, locale) {
  locale = locale || currentLocale
  return cacheable(
    locale + ':format:' + pattern,
    () => new MessageFormat(
      translate(pattern, locale),
      locale, { cache: enableCache }
    ).format
  )(args)
}

function translate (originalPattern, locale) {
  locale = locale || currentLocale
  const pattern = currentTranslate(originalPattern, locale)
  if (pattern != null) { return pattern }

  const replacement = missingReplacement || originalPattern
  const message = 'no ' + locale + ' translation found for ' +
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

formatMessage.setup = function setup (opt={}) {
  if (typeof opt.cache === 'boolean') enableCache = opt.cache
  if (opt.locale) currentLocale = opt.locale
  if (opt.translate) currentTranslate = opt.translate
  if ('missingReplacement' in opt) missingReplacement = opt.missingReplacement
  if (opt.missingTranslation) missingTranslation = opt.missingTranslation
}

formatMessage.number = function (locale, value, style='medium') {
  return cacheable(
    locale + ':number:' + style,
    () => (typeof Intl !== 'undefined' && Intl.NumberFormat) ?
      new Intl.NumberFormat(locale, number[style]).format :
      arg => Number(arg).toLocaleString(locale, number[style])
  )(value)
}

formatMessage.date = function (locale, value, style='medium') {
  return cacheable(
    locale + ':date:' + style,
    () => (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ?
      new Intl.DateTimeFormat(locale, date[style]).format :
      arg => new Date(arg).toLocaleDateString(locale, date[style])
  )(value)
}

formatMessage.time = function (locale, value, style='medium') {
  return cacheable(
    locale + ':time:' + style,
    () => (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ?
      new Intl.DateTimeFormat(locale, time[style]).format :
      arg => new Date(arg).toLocaleTimeString(locale, time[style])
  )(value)
}
