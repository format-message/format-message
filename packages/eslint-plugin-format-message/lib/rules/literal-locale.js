'use strict'

var astUtil = require('../util/ast')
var visitFormatCall = require('../util/visit-format-call')

module.exports = function (context) {
  return visitFormatCall(context, function (node) {
    var locale = node.arguments[2]
    if (locale && !astUtil.isStringish(locale)) {
      context.report(locale, 'Locale is not a string literal')
    }
  })
}

module.exports.schema = []
