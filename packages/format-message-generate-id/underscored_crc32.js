// @flow
'use strict'
var crc32 = require('crc32')
var normalized = require('./normalized')
var underscore = require('./underscored').underscore

module.exports = function underscoredCrc32 (pattern/*: string */)/*: string */ {
  pattern = normalized(pattern)
  var underscored = underscore(pattern)
  var crc = crc32(pattern.length + ':' + pattern).toString(16)
  return underscored + '_' + crc
}
