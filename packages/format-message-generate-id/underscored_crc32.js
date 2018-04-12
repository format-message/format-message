// @flow
'use strict'
const crc32 = require('crc32')
const normalized = require('./normalized')
const underscore = require('./underscored').underscore

module.exports = function underscoredCrc32 (pattern/*: string */)/*: string */ {
  pattern = normalized(pattern)
  const underscored = underscore(pattern)
  const crc = crc32(pattern.length + ':' + pattern).toString(16)
  return underscored + '_' + crc
}
