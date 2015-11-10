'use strict'

var fs = require('fs')
var path = require('path')
var util = require('format-message-babel-util')
var generate = require('format-message-generate-id')
var parse = require('format-message-parse')
var lookupClosestLocale = require('lookup-closest-locale')
var inlineMessage = require('./inline-message')

module.exports = function (bbl) {
  var t = bbl.types

  function generateId (type, pattern) {
    var fn = typeof type === 'function' ? type
      : generate[type] || generate.underscored_crc32
    return fn(pattern)
  }

  function getTranslations (opts) {
    if (typeof opts.translations === 'string') {
      opts.translations = require(path.resolve(opts.translations))
    }
    return opts.translations
  }

  function translate (locale, id, translations) {
    locale = lookupClosestLocale(locale, translations)
    var translated = translations[locale] && translations[locale][id]
    if (translated && translated.message) translated = translated.message
    if (translated != null) return translated
  }

  return {
    visitor: {
      CallExpression: function (path, state) {
        if (!util.isFormatMessage(path.get('callee'))) return
        var args = path.get('arguments')
        var message = util.getMessageDetails(args)
        if (!message || !message.default) return

        // all allowed options
        var translations = state.opts.inline && getTranslations(state.opts)
        var shouldInline = state.opts.inline || false
        var defaultLocale = state.opts.locale || 'en'
        var missingTranslation = state.opts.missingTranslation || 'warning'
        var missingReplacement = state.opts.missingReplacement
        var idType = state.opts.generateId

        // nothing to do if not inlining and it already has an explicit id
        if (message.id && !shouldInline) return

        var id = message.id ||
          (message.id = generateId(idType, message.default))

        // just add the generated id and remove description and other metadata
        if (!shouldInline) {
          args[0].replaceWith(t.objectExpression([
            t.objectProperty(
              t.identifier('id'),
              t.stringLiteral(id)
            ),
            t.objectProperty(
              t.identifier('default'),
              t.stringLiteral(message.default)
            )
          ]))
          return
        }

        // get translation and replace if necessary
        var locale = util.getTargetLocale(args) || defaultLocale
        var pattern = translations
          ? translate(locale, id, translations)
          : message.default
        if (pattern == null && missingTranslation !== 'ignore') {
          var message = 'No ' + locale + ' translation found for ' + id
          if (missingTranslation === 'warning') {
            console.warn(message)
          } else { // 'error'
            throw new ReferenceError(message)
          }
        } else if (pattern == null) {
          pattern = missingReplacement || message.default
        }

        // replace with inline message
        var ast = parse(pattern)
        path.replaceWith(inlineMessage(locale, ast, path, t))
      }
    }
  }
}
