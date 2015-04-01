/*global Intl:false */
import MessageFormat from 'message-format'

const formats = MessageFormat.data.formats
const { number, date, time, cache } = formats

let enableCache = true
let currentLocale = 'en'
let currentTranslate = pattern => pattern

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
      currentTranslate(pattern, locale),
      locale, { cache: enableCache }
    ).format
  )(args)
}

formatMessage.setup = function ({ cache, locale, translate }={}) {
  if (typeof cache === 'boolean') enableCache = cache
  if (locale) currentLocale = locale
  if (translate) currentTranslate = translate
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
