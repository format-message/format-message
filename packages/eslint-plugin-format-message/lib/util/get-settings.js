'use strict'

var pathUtil = require('path')
var generate = require('format-message-generate-id')

module.exports = function getSettings (context) {
  var settings = context.settings['format-message'] || {}
  var resolved = {}

  resolved.sourceLocale = settings.sourceLocale

  var translations = {}
  if (typeof settings.translations === 'string') {
    try {
      translations = require(pathUtil.resolve(settings.translations))
    } catch (err) {
      console.warn(err.message)
    }
  } else if (typeof settings.translations === 'object') {
    Object.keys(settings.translations).forEach(function (locale) {
      var localeData = settings.translations[locale]
      if (typeof localeData === 'string') {
        try {
          localeData = require(pathUtil.resolve(localeData))
          if (localeData[locale]) localeData = localeData[locale]
        } catch (err) {
          localeData = {}
          console.warn(err.message)
        }
      }
      translations[locale] = localeData
    })
  }
  resolved.translations = translations

  var generateId = generate[settings.generateId] || generate.underscored_crc32
  resolved.generateId = function (pattern) {
    try {
      return generateId(pattern)
    } catch (_) {
      return null
    }
  }

  return resolved
}
