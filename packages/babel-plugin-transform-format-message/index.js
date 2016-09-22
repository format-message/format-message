'use strict'

var path = require('path')
var util = require('format-message-estree-util')
var generate = require('format-message-generate-id')
var parse = require('format-message-parse')
var lookupClosestLocale = require('lookup-closest-locale')
var inlineMessage = require('./inline-message')
var inlineMessageJSX = require('./inline-message-jsx')

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
        util.setBabelContext(path, state)
        if (!util.isFormatMessage(path.node.callee)) return
        var args = path.node.arguments
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
          path.get('arguments.0').replaceWith(t.objectExpression([
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
          var errMessage = 'No ' + locale + ' translation found for ' + id
          if (missingTranslation === 'warning') {
            console.warn(errMessage)
          } else { // 'error'
            throw path.buildCodeFrameError(errMessage, ReferenceError)
          }
        }
        if (pattern == null) {
          pattern = missingReplacement || message.default
          if (typeof pattern === 'function') {
            pattern = pattern(message.default, message.id, locale)
          }
        }

        // replace with inline message
        var ast = parse(pattern)
        path.replaceWith(inlineMessage(locale, ast, path, t))
      },
      JSXElement: function (path, state) {
        util.setBabelContext(path, state)
        if (!util.isTranslatableElement(path.node)) return
        var message = util.getElementMessageDetails(path.node)
        if (!message || !message.default) return

        // all allowed options
        var translations = state.opts.inline && getTranslations(state.opts)
        var shouldInline = state.opts.inline || false
        var defaultLocale = state.opts.locale || 'en'
        var missingTranslation = state.opts.missingTranslation || 'warning'
        var missingReplacement = state.opts.missingReplacement
        var idType = state.opts.generateId
        var jsxTarget = state.opts.jsxTarget || 'react'

        var id = message.id ||
          (message.id = generateId(idType, message.default))

        var hasParameters = Object.keys(message.parameters).length > 0
        var hasWrappers = Object.keys(message.wrappers).length > 0

        // remove translate attribute
        path.get('openingElement.attributes').forEach(function (attribute) {
          if (attribute.get('name').isJSXIdentifier({ name: 'translate' })) {
            attribute.remove()
          }
        })

        // just add the generated id and remove description and other metadata
        if (!shouldInline) {
          var formatMessageId = state.addImport(
            'format-message', 'default', 'formatMessage'
          )
          var formatChildrenId = hasWrappers && state.addImport(
            'format-message/' + jsxTarget, 'formatChildren'
          )
          var formatMessageCall =
            t.callExpression(formatMessageId, [
              t.objectExpression([
                t.objectProperty(
                  t.identifier('id'),
                  t.stringLiteral(id)
                ),
                t.objectProperty(
                  t.identifier('default'),
                  t.stringLiteral(message.default)
                )
              ])
            ].concat(!hasParameters ? [] : [
              t.objectExpression(Object.keys(message.parameters).map(function (name) {
                return t.objectProperty(
                  t.identifier(name),
                  (message.parameters[name].originalElement)
                    ? t.stringLiteral(message.parameters[name].value)
                    : message.parameters[name]
                )
              }))
            ]))
          if (hasWrappers) {
            formatMessageCall = t.callExpression(formatChildrenId, [
              formatMessageCall,
              t.arrayExpression(Object.keys(message.wrappers).map(function (name) {
                var node = message.wrappers[name].node
                var selfClosing = message.wrappers[name].options.selfClosing
                if (!selfClosing) {
                  node.openingElement.selfClosing = true
                  node.closingElement = null
                  node.children = []
                }
                return node
              }))
            ])
          }

          path.replaceWith(t.jSXElement(
            path.node.openingElement,
            path.node.closingElement,
            [t.jSXExpressionContainer(formatMessageCall)]
          ))
          return
        }

        // get translation and replace if necessary
        var locale = util.getElementTargetLocale(path) || defaultLocale
        var pattern = translations
          ? translate(locale, id, translations)
          : message.default
        if (pattern == null && missingTranslation !== 'ignore') {
          var errMessage = 'No ' + locale + ' translation found for ' + id
          if (missingTranslation === 'warning') {
            console.warn(errMessage)
          } else { // 'error'
            throw path.buildCodeFrameError(errMessage, ReferenceError)
          }
        }
        if (pattern == null) {
          pattern = missingReplacement || message.default
          if (typeof pattern === 'function') {
            pattern = pattern(message.default, message.id, locale)
          }
        }

        // replace with inline message
        message.pattern = pattern
        message.locale = locale
        message.path = path
        message.t = t
        message.helper = function (type) {
          return state.addImport('format-message', type)
        }

        path.replaceWith(t.jSXElement(
          path.node.openingElement,
          path.node.closingElement,
          inlineMessageJSX(message)
        ))
      }
    }
  }
}
