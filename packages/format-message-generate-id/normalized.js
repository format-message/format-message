// @flow
'use strict'
const parse = require('format-message-parse')
const print = require('format-message-print')

module.exports = function normalized (pattern/*: string */)/*: string */ {
  return print(parse(pattern)).replace(/\s+/g, ' ')
}
