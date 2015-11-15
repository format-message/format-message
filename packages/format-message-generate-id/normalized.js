'use strict'

var parse = require('format-message-parse')
var print = require('format-message-print')

module.exports = function normalized (pattern) {
  return print(parse(pattern)).replace(/\s+/g, ' ')
}
