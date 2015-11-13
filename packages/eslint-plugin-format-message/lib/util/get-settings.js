'use strict'

var pathUtil = require('path')
var generate = require('format-message-generate-id')

module.exports = function getSettings (context) {
  var settings = context.settings['format-message'] || {}
  if (typeof settings.generateId !== 'function') {
    var translations = settings.translations || (settings.translations = {})
    if (typeof translations === 'string') {
      try {
        translations = settings.translations =
          require(pathUtil.resolve(translations))
      } catch (err) {
        console.warn(err.message)
        translations = settings.translations = {}
      }
    }
    Object.keys(translations).forEach(function (locale) {
      if (typeof translations[locale] === 'string') {
        try {
          translations[locale] = require(pathUtil.resolve(translations[locale]))[locale]
        } catch (err) {
          console.warn(err.message)
          translations[locale] = null
        }
      }
    })
    var generateId = generate[settings.generateId] || generate.underscored_crc32
    settings.generateId = function (pattern) {
      try {
        return generateId(pattern)
      } catch (_) {
        return null
      }
    }
  }
  return settings
}
