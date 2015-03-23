import slug from 'speakingurl'
import crc32 from 'crc32'
import Parser from 'message-format/parser'
import Printer from 'message-format/printer'

export function getTranslate (options) {
  if (options.translate) {
    return options.translate
  }

  if (!options.translations) {
    return pattern => pattern
  }

  const getKey = getGetKey(options)
  return function (pattern, locales) {
    const translations = options.translations
    const key = getKey(pattern)
    locales = [].concat(locales)
    for (let locale of locales) {
      const parts = locale.split('-')
      while (parts.length) {
        const current = parts.join('-')
        if (current in translations && key in translations[current]) {
          return translations[current][key]
        }
        parts.pop()
      }
    }
  }
}

export function getGetKey (options) {
  switch (options.keyType) {
    case 'underscored_crc32':
      return getKeyUnderscoredCrc32
    case 'underscored':
      return getKeyUnderscored
    case 'normalized':
      return getKeyNormalized
    default: // 'literal'
      return pattern => pattern
  }
}

export function getKeyNormalized (pattern) {
  return Printer.print(Parser.parse(pattern)).replace(/\s+/g, ' ')
}

export function getKeyUnderscored (pattern) {
  pattern = getKeyNormalized(pattern)
  return slug(pattern, { separator: '_', lang: false })
    .replace(/[-_]+/g, '_')
    .slice(0, 50)
}

export function getKeyUnderscoredCrc32 (pattern) {
  pattern = getKeyNormalized(pattern)
  const underscored = slug(pattern, { separator: '_', lang: false })
    .replace(/[-_]+/g, '_')
    .slice(0, 50)
  const crc = crc32(pattern.length + ':' + pattern)
    .toString(16)
  return underscored + '_' + crc
}
