// @flow
'use strict'
const normalized = require('./normalized')

// credits to http://jsperf.com/unicode-to-ascii/3
const table =
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
  let clean = ''
  const strLength = str.length
  const tableLength = table.length
  for (let s = 0; s < strLength; ++s) {
    let ch = str[s]
    const t = ch.charCodeAt(0) - 192 // Index of character code in the strip string
    if (t >= 0 && t < tableLength) {
      const ascii = table[t] // Character is within our table, so we can strip the accent...
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
