'use strict'

var getCommonTranslationInfo = require('../util/get-common-translation-info')
var visitFormatCall = require('../util/visit-format-call')

var validatePath = function (object, path) {
  var pathSegments = path.split('.') || path
  var isValid = false
  var lookFurther = function (object, segment) {
    if (object.properties[0].value.type === 'Literal') {
      return object.properties[0].value.value === segment
    } else {
      return lookFurther(object.properties[0].value, segment)
    }
  }
  pathSegments.forEach(function (segment, i) {
    if (i === 0) {
      isValid = object.key.value === segment
    } else if (object.value.properties[0].value.type === 'ObjectExpression') {
      isValid = object.value.properties[0].key.value === segment
      if (!isValid) {
        isValid = lookFurther(object.value.properties[0].value, segment)
      }
    } else if (object.value.properties[0].value.type === 'Literal') {
      isValid = object.value.properties[0].value.value === segment
    }
  })
  return isValid
}

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
      var info = getCommonTranslationInfo(context, node)
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
            if (prop.value.type === 'ObjectExpression') {
              return validatePath(prop, paramName)
            }
            return (
              (prop.key.type === 'Identifier' && prop.key.name === paramName) ||
              (prop.key.type === 'Literal' && prop.key.value === paramName)
            )
          })
          if (!isFound) {
            context.report(node.arguments[1], 'Pattern requires missing "' + paramName + '" parameter')
          }
        })
      }
    })
  }
}
