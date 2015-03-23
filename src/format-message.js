/*global Intl:false */
import MessageFormat from 'message-format'

const formats = MessageFormat.data.formats
let cache = formats.cache
let options = {
  enableCache: true,
  locale: 'en',
  translate (pattern) {
    return pattern
  }
}

function cached (key, fn) {
  if (options.enableCache && key in cache) {
    return cache[key]
  } else {
    const value = fn()
    if (options.enableCache) {
      cache[key] = value
    }
    return value
  }
}

function formatMessage (pattern, args, locale) {
  locale = locale || options.locale
  const key = locale + ':format:' + pattern
  const func = cached(key, () => {
    const localPattern = options.translate(pattern, locale)
    return new MessageFormat(localPattern, locale, { cache: options.enableCache }).format
  })
  return func(args)
}

formatMessage.setup = function ({ cache, locale, translate }={}) {
  options.enableCache = typeof cache === 'boolean' ? cache : options.enableCache
  options.locale = locale || options.locale
  options.translate = translate || options.translate
}

formatMessage.number = function (locale, num, style='medium') {
  const key = locale + ':number:' + style
  const func = cached(key,
    () => new Intl.NumberFormat(locale, formats.number[style]).format
  )
  return func(num)
}

formatMessage.date = function (locale, date, style='medium') {
  const key = locale + ':date:' + style
  const func = cached(key,
    () => new Intl.DateTimeFormat(locale, formats.date[style]).format
  )
  return func(date)
}

formatMessage.time = function (locale, date, style='medium') {
  const key = locale + ':time:' + style
  const func = cached(key,
    () => new Intl.DateTimeFormat(locale, formats.time[style]).format
  )
  return func(date)
}

export default formatMessage
