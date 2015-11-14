/*!
 * Intl.MessageFormat prollyfill
 * Copyright(c) 2015 Andy VanWagoner
 * MIT licensed
 **/
'use strict'

var parse = require('format-message-parse')
var interpret = require('format-message-interpret')
var closestSupportedLocale = interpret.closestSupportedLocale

function MessageFormat (locales, pattern) {
  if (!(this instanceof MessageFormat)) {
    return new MessageFormat(locales, pattern)
  }

  var root = interpret(locales, parse(pattern))
  this._internal = {
    locale: closestSupportedLocale(locales),
    format: typeof root === 'string'
      ? function format () { return root }
      : root
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
      // if the closest match is a prefix of the requested,
      // and it isn't a duplicate, then it is supported
      return [].concat(requestedLocales || [])
        .filter(function (locale, i, array) {
          var closest = closestSupportedLocale(locale)
          return (
            closest === locale.slice(0, closest.length) &&
            array.indexOf(locale) === i
          )
        })
    }
  }
})
