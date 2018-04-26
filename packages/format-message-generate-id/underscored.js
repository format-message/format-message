// @flow
'use strict'
var normalized = require('./normalized')

// credits to http://jsperf.com/unicode-to-ascii/3
var table =
  'AAAAAAACEEEEIIII' +
  'DNOOOOO.OUUUUY..' +
  'aaaaaaaceeeeiiii' +
  'dnooooo.ouuuuy.y' +
  'AaAaAaCcCcCcCcDd' +
  'DdEeEeEeEeEeGgGg' +
  'GgGgHhHhIiIiIiIi' +
  'IiIiJjKkkLlLlLlL' +
  'lJlNnNnNnnNnOoOo' +
  'OoOoRrRrRrSsSsSs' +
  'SsTtTtTtUuUuUuUu' +
  'UuUuWwYyYZzZzZz.'
function stripAccent (str/*: string */) {
  var clean = ''
  var strLength = str.length
  var tableLength = table.length
  for (var s = 0; s < strLength; ++s) {
    var ch = str[s]
    var t = ch.charCodeAt(0) - 192 // Index of character code in the strip string
    if (t >= 0 && t < tableLength) {
      var ascii = table[t] // Character is within our table, so we can strip the accent...
      if (ascii !== '.') ch = ascii // ...unless it was shown as a '.'
    }
    clean += ch
  }
  return clean
}

function underscore (str/*: string */) {
  return stripAccent(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50)
}

module.exports = function underscored (pattern/*: string */)/*: string */ {
  return underscore(normalized(pattern))
}

module.exports.underscore = underscore
