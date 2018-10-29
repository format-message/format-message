// @flow
'use strict'
var interpret = require('format-message-interpret')
var parse = require('format-message-parse')
var plurals = require('format-message-interpret/plurals')
var supportedExp = new RegExp(
  '^(' + Object.keys(plurals).join('|') + ')\\b'
)

/*::
import type { Types } from 'format-message-interpret'
import type { AST } from 'format-message-parse'
type Options = {
  types: Types
}
type Internals = {
  ast: AST,
  format: (args?: Object) => string,
  locale: string,
  locales?: string | string[],
  toParts?: (args?: Object) => any[],
  options?: Options
}
*/

var internals/*: WeakMap<Object, Internals> */ = new WeakMap()

/*!
 * Intl.MessageFormat prollyfill
 * Copyright(c) 2015 Andy VanWagoner
 * MIT licensed
 **/
function MessageFormat (
  pattern/*: string */,
  locales/*:: ?: string | string[] */,
  options/*:: ?: Options */
) {
  if (!(this instanceof MessageFormat) || internals.has(this)) {
    throw new TypeError('calling MessageFormat constructor without new is invalid')
  }
  var ast = parse(pattern)
  internals.set(this, {
    ast: ast,
    format: interpret(ast, locales, options && options.types),
    locale: MessageFormat.supportedLocalesOf(locales)[0] || 'en',
    locales: locales,
    options: options
  })
}
module.exports = MessageFormat

// $FlowFixMe It thinks `value` needs to be defined for format
Object.defineProperties(MessageFormat.prototype, {
  format: {
    configurable: true,
    get: function format () {
      var values = internals.get(this)
      if (!values) throw new TypeError('MessageFormat.prototype.format called on value that\'s not an object initialized as a MessageFormat')
      return values.format
    }
  },
  formatToParts: {
    configurable: true,
    writable: true,
    value: function formatToParts (args/*:: ?: Object */) {
      var values = internals.get(this)
      if (!values) throw new TypeError('MessageFormat.prototype.formatToParts called on value that\'s not an object initialized as a MessageFormat')
      var frmt = values.toParts || (values.toParts = interpret.toParts(
        values.ast,
        values.locales,
        values.options && values.options.types
      ))
      return frmt(args)
    }
  },
  resolvedOptions: {
    configurable: true,
    writable: true,
    value: function resolvedOptions () {
      var values = internals.get(this)
      if (!values) throw new TypeError('MessageFormat.prototype.resolvedOptions called on value that\'s not an object initialized as a MessageFormat')
      return {
        locale: values.locale
      }
    }
  }
})

/* istanbul ignore else */
if (typeof Symbol !== 'undefined') {
  Object.defineProperty(MessageFormat.prototype, Symbol.toStringTag, { value: 'Object' })
}

Object.defineProperties(MessageFormat, {
  supportedLocalesOf: {
    configurable: true,
    writable: true,
    value: function supportedLocalesOf (requestedLocales/*:: ?: string | string[] */) {
      return [].concat(
        Intl.NumberFormat.supportedLocalesOf(requestedLocales),
        Intl.DateTimeFormat.supportedLocalesOf(requestedLocales),
        Intl.PluralRules ? Intl.PluralRules.supportedLocalesOf(requestedLocales) : [],
        [].concat(requestedLocales || []).filter(function (locale) {
          return supportedExp.test(locale)
        })
      ).filter(function (v, i, a) { return a.indexOf(v) === i })
    }
  }
})
