/* globals Intl */
'use strict'

var formats = require('format-message-formats')
var lookupClosestLocale = require('lookup-closest-locale')
var plurals = require('./plurals')

module.exports = function interpret (locale, ast) {
  return interpretSubs(locale, ast)
}

// useful for detecting what the resolved locale will be
module.exports.closestSupportedLocale = function (locale) {
  return lookupClosestLocale(locale, plurals)
}

function interpretSubs (locale, elements, parent) {
  elements = elements.map(function (element) {
    return interpretElement(locale, element, parent)
  })

  // optimize common case
  if (elements.length === 1) {
    return elements[0]
  }

  return function format (args) {
    var message = ''
    for (var e = 0, ee = elements.length; e < ee; ++e) {
      message += typeof elements[e] === 'string'
        ? elements[e]
        : elements[e](args)
    }
    return message
  }
}

function interpretElement (locale, element, parent) {
  if (typeof element === 'string') {
    return element
  }

  var id = element[0]
  var type = element[1]
  var style = element[2]
  var offset = 0
  var options

  if (id === '#') {
    id = parent[0]
    type = 'number'
    offset = parent[2]
    style = null
  }

  switch (type) {
    case 'number':
    case 'ordinal': // TODO: rbnf
    case 'spellout': // TODO: rbnf
    case 'duration': // TODO: duration
      return interpretNumber(locale, id, offset, style)
    case 'date':
    case 'time':
      return interpretDateTime(locale, id, type, style)
    case 'plural':
    case 'selectordinal':
      offset = element[2]
      options = element[3]
      return interpretPlural(locale, id, type, offset, options)
    case 'select':
      return interpretSelect(locale, id, style)
    default:
      return interpretSimple(id)
  }
}

function helper (type, style, locale) {
  var options = formats[type][style] || formats[type].default
  var cache = options.cache || (options.cache = {})
  var format = cache[locale] || (cache[locale] = type === 'number'
    ? Intl.NumberFormat(locale, options).format
    : Intl.DateTimeFormat(locale, options).format
  )
  return format
}

function interpretNumber (locale, id, offset, style) {
  offset = offset || 0
  var frmt = helper('number', style, locale)
  return function format (args) {
    return frmt(+getArg(id, args) - offset)
  }
}

function interpretDateTime (locale, id, type, style) {
  var frmt = helper(type, style, locale)
  return function format (args) {
    return frmt(getArg(id, args))
  }
}

function interpretPlural (locale, id, type, offset, children) {
  var parent = [ id, type, offset ]
  var options = {}
  Object.keys(children).forEach(function (key) {
    options[key] = interpretSubs(locale, children[key], parent)
  })

  var closest = lookupClosestLocale(locale, plurals)
  var plural = type === 'selectordinal'
    ? plurals[closest].ordinal
    : plurals[closest].cardinal
  if (!plural) return options.other

  return function format (args) {
    var clause =
      options['=' + +getArg(id, args)] ||
      options[plural(getArg(id, args) - offset)] ||
      options.other
    if (typeof clause === 'string') return clause
    return clause(args)
  }
}

function interpretSelect (locale, id, children) {
  var options = {}
  Object.keys(children).forEach(function (key) {
    options[key] = interpretSubs(locale, children[key], null)
  })
  return function format (args) {
    var clause =
      options[getArg(id, args)] ||
      options.other
    if (typeof clause === 'string') return clause
    return clause(args)
  }
}

function interpretSimple (id) {
  return function format (args) {
    return '' + getArg(id, args)
  }
}

function getArg (id, args) {
  if (id in args) return args[id]
  var parts = id.split('.')
  var a = args
  for (var i = 0, ii = parts.length; i < ii; ++i) {
    a = a[parts[i]]
  }
  return a
}
