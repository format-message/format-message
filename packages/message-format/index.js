/*!
 * Intl.MessageFormat prollyfill
 * Copyright(c) 2015 Andy VanWagoner
 * MIT licensed
 **/
'use strict'

var parse = require('format-message-parse')
var interpret = require('format-message-interpret')

function MessageFormat (locales, pattern) {
  if (!(this instanceof MessageFormat)) {
    return new MessageFormat(locales, pattern)
  }

  var root = interpret(locales, parse(pattern))
  this._internal = {
    locale: MessageFormat.supportedLocalesOf(locales)[0] || 'en',
    format: root
  }
}
module.exports = MessageFormat

Object.defineProperties(MessageFormat.prototype, {
  resolvedOptions: {
    configurable: true,
    writable: true,
    value: function resolvedOptions () {
      return {
        locale: this._internal.locale
      }
    }
  },
  format: {
    configurable: true,
    get: function () {
      return this._internal.format
    }
  },
  _internal: {
    configurable: true,
    writable: true,
    value: {
      locale: 'en',
      format: function format () {
        return ''
      }
    }
  }
})

Object.defineProperties(MessageFormat, {
  supportedLocalesOf: {
    configurable: true,
    writable: true,
    value: function supportedLocalesOf (requestedLocales) {
      // only those supported by all Intl objects used
      return Intl.NumberFormat.supportedLocalesOf(
        Intl.DateTimeFormat.supportedLocalesOf(
          Intl.PluralRules
            ? Intl.PluralRules.supportedLocalesOf(requestedLocales)
            : requestedLocales
        )
      )
    }
  }
})
