'use strict'

var util = require('format-message-estree-util')
var visitFormatCall = require('../util/visit-format-call')

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitFormatCall(context, function (node) {
      var locale = node.arguments[2]
      if (locale && !util.isStringish(locale)) {
        context.report(locale, 'Locale is not a string literal')
      }
    })
  }
}
