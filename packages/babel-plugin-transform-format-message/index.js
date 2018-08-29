'use strict'

var path = require('path')
var imports = require('@babel/helper-module-imports')
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
    var translated = locale && translations[locale] && translations[locale][id]
    if (translated && translated.message) translated = translated.message
    if (translated != null) return translated
  }

  function removeTranslateAttribute (path) {
    path.get('openingElement.attributes').forEach(function (attribute) {
      if (attribute.get('name').isJSXIdentifier({ name: 'translate' })) {
        attribute.remove()
      }
    })
  }

  return {
    visitor: {
      CallExpression: function (path, state) {
        util.setBabelContext(path, state)
        var isRich = util.isRichMessage(path.node.callee)
        if (!util.isFormatMessage(path.node.callee) && !isRich) return
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
            throw path.get('arguments')[0].buildCodeFrameError(errMessage, ReferenceError)
          }
        }
        if (pattern == null) {
          pattern = missingReplacement || message.default
          if (typeof pattern === 'function') {
            pattern = pattern(message.default, message.id, locale)
          }
        }

        // replace with inline message
        try {
          var tagsType = isRich ? '<>' : null
          var ast = parse(pattern, { tagsType: tagsType })
        } catch (err) {
          throw path.get('arguments')[0].buildCodeFrameError(err.message, ReferenceError)
        }
        path.replaceWith(inlineMessage(locale, ast, tagsType, path, t))
      },
      JSXElement: function (path, state) {
        util.setBabelContext(path, state)
        if (!util.isTranslatableElement(path.node)) return removeTranslateAttribute(path)
        var message = util.getElementMessageDetails(path.node)
        if (!message || !message.default) return removeTranslateAttribute(path)

        // all allowed options
        var translations = state.opts.inline && getTranslations(state.opts)
        var shouldInline = state.opts.inline || false
        var defaultLocale = state.opts.locale || 'en'
        var missingTranslation = state.opts.missingTranslation || 'warning'
        var missingReplacement = state.opts.missingReplacement
        var idType = state.opts.generateId

        var id = message.id ||
          (message.id = generateId(idType, message.default))

        var hasParameters = Object.keys(message.parameters).length > 0
        var hasWrappers = Object.keys(message.wrappers).length > 0

        removeTranslateAttribute(path)

        // just add the generated id and remove description and other metadata
        if (!shouldInline) {
          var formatMessageId = imports.addDefault(
            path, 'format-message', { nameHint: 'formatMessage' }
          )
          var childrenId
          var formatMessageCall =
            t.callExpression(t.memberExpression(formatMessageId, t.identifier('rich')), [
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
            ].concat(!hasParameters && !hasWrappers ? [] : [
              t.objectExpression(Object.keys(message.parameters).map(function (name) {
                return t.objectProperty(
                  t.identifier(name),
                  (message.parameters[name].originalElement)
                    ? t.stringLiteral(message.parameters[name].value)
                    : message.parameters[name]
                )
              }).concat(Object.keys(message.wrappers).map(function (name) {
                var node = message.wrappers[name].node
                if (!util.getAttribute(node, 'key')) {
                  node.openingElement.attributes = [
                    t.jSXAttribute(
                      t.jSXIdentifier('key'),
                      t.stringLiteral(name)
                    )
                  ].concat(node.openingElement.attributes || [])
                }
                var selfClosing = message.wrappers[name].options.selfClosing
                if (!selfClosing) {
                  if (!childrenId) {
                    childrenId = path.scope.generateUidIdentifier('children')
                  }
                  node.children = [t.jSXExpressionContainer(childrenId)]
                }
                return t.objectProperty(
                  t.identifier(name),
                  selfClosing ? node : t.arrowFunctionExpression(
                    [ t.objectPattern([ t.objectProperty(
                      t.identifier('children'),
                      childrenId,
                      false,
                      true
                    ) ]) ],
                    node
                  )
                )
              })))
            ]))

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
          return imports.addNamed(path, type, 'format-message')
        }

        path.replaceWith(t.jSXElement(
          path.node.openingElement,
          path.node.closingElement,
          inlineMessageJSX(message)
        ))
      },
      Program: {
        exit: function (path, state) {
          path.scope.crawl()
          path.traverse({
            ImportDeclaration: function (path, state) {
              if (!path.get('source').isStringLiteral({ value: 'format-message' })) return
              var isReferenced = path.node.specifiers.some(function (specifier) {
                var binding = path.scope.getBinding(specifier.local.name)
                return binding.referenced
              })
              if (!isReferenced) path.remove()
            }
          }, state)
        }
      }
    }
  }
}
