/**
 * Print
 *
 * Turns this:
 *  [ "You have ", [ "numBananas", "plural", 0, {
 *       "=0": [ "no bananas" ],
 *      "one": [ "a banana" ],
 *    "other": [ [ '#' ], " bananas" ]
 *  } ], " for sale." ]
 *
 * into this:
 *  `You have { numBananas, plural,
 *       =0 {no bananas}
 *      one {a banana}
 *    other {# bananas}
 *  } for sale`
 **/
'use strict'

module.exports = function print (ast) {
  return printMessage(ast)
}

function printMessage (ast, parent) {
  return ast.map(function (element) {
    return printElement(element, parent)
  }).join('')
}

function printElement (element, parent) {
  if (typeof element === 'string') {
    return printString(element, parent)
  }

  if (element[0] === '#') {
    return '#'
  }

  var type = element[1]
  switch (type) {
    case 'plural':
    case 'selectordinal':
      return printPlural(element)
    case 'select':
      return printSelect(element)
    default:
      return printArgument(element)
  }
}

function printString (element, parent) {
  var special = (parent === 'plural') ? /[{}#]+/g : /[{}]+/g
  return element
    .replace(/'/g, '\'\'') // double apostrophe
    .replace(special, '\'$&\'') // escape syntax
}

function printArgument (element) {
  var key = element[0]
  var type = element[1]
  var style = element[2]
  return '{ ' +
    key +
    (type ? ', ' + type : '') +
    (style ? ', ' + printString(style) : '') +
  ' }'
}

function printPlural (element) {
  var key = element[0]
  var type = element[1]
  var offset = element[2]
  var options = element[3]
  return '{ ' + key + ', ' + type + ',' +
    (offset ? ' offset:' + offset : '') +
    printOptions(options, 'plural') +
  '\n}'
}

function printSelect (element) {
  var key = element[0]
  var type = element[1]
  var options = element[2]
  return '{ ' + key + ', ' + type + ',' +
    printOptions(options, 'select') +
  '\n}'
}

function printOptions (options, parent) {
  var keys = Object.keys(options)
  var padLength = Math.max.apply(Math, keys.map(function (key) { return key.length }))
  return keys.map(function (key) {
    return '\n  ' + leftSpacePad(key, padLength) +
      ' {' + printMessage(options[key], parent) + '}'
  }).join('')
}

function leftSpacePad (string, count) {
  var padding = ''
  for (var i = string.length; i < count; ++i) {
    padding += ' '
  }
  return padding + string
}
