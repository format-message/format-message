'use strict'

var getCommonTranslationInfo = require('../util/get-common-translation-info')
var visitFormatCall = require('../util/visit-format-call')

module.exports = {
  meta: {
    schema: [ {
      type: 'object',
      properties: {
        allowNonLiteral: {
          type: 'boolean'
        }
      }
    } ]
  },
  create: function (context) {
    var allowNonLiteral = (context.options[0] || {}).allowNonLiteral

    return visitFormatCall(context, function (node) {
      var info = getCommonTranslationInfo(node)
      if (!info.patternAst) return // error in pattern, can't validate
      if (!info.patternParams.length) return // pattern does not require parameters

      var params = node.arguments[1]
      var isLiteral = params && params.type === 'ObjectExpression'
      if (params && !isLiteral && allowNonLiteral) return

      if (!params) {
        context.report(node.arguments[0], 'Pattern requires missing parameters')
      } else if (!isLiteral) {
        context.report(node.arguments[1], 'Parameters is not an object literal')
      } else {
        info.patternParams.forEach(function (paramName) {
          var isFound = params.properties.some(function (prop) {
            return prop.key.type === 'Identifier' && prop.key.name === paramName
          })
          if (!isFound) {
            context.report(node.arguments[1], 'Pattern requires missing "' + paramName + '" parameter')
          }
        })
      }
    })
  }
}
