'use strict'

exports.isImportFormatMessage = isImportFormatMessage
function isImportFormatMessage (path) {
  return (
    (
      path.isImportDefaultSpecifier() ||
      path.isImportSpecifier() &&
      path.get('imported').isIdentifier({ name: 'default' })
    ) && path.parentPath.get('source')
      .isStringLiteral({ value: 'format-message' })
  )
}

exports.isRequireFormatMessage = isRequireFormatMessage
function isRequireFormatMessage (path) {
  var arg
  return (
    path.isVariableDeclarator() &&
    path.get('init').isCallExpression() &&
    path.get('init.callee').isIdentifier({ name: 'require' }) &&
    !!(arg = path.get('init.arguments')[0]) &&
    arg.isStringLiteral({ value: 'format-message' })
  )
}

exports.isFormatMessage = isFormatMessage
function isFormatMessage (callee) {
  if (!callee.isIdentifier()) return false
  var binding = callee.scope.getBinding(callee.node.name)
  if (!binding) return false

  return (
    isImportFormatMessage(binding.path) ||
    isRequireFormatMessage(binding.path)
  )
}

exports.isLiteralish = isLiteralish
function isLiteralish (path) {
  return (
    (
      path.isLiteral() &&
      !path.isTemplateLiteral()
    ) || (
      path.isTemplateLiteral() &&
      path.node.expressions.length === 0 &&
      path.node.quasis.length === 1
    ) || (
      path.isBinaryExpression({ operator: '+' }) &&
      isLiteralish(path.get('left')) &&
      isLiteralish(path.get('right'))
    )
  )
}

exports.getLiteralValue = getLiteralValue
function getLiteralValue (path) {
  // assumes isLiteralish(path) === true
  var node = path.node
  switch (node.type) {
    case 'NullLiteral':
      return null
    case 'RegExpLiteral':
      return new RegExp(node.pattern, node.flags)
    case 'TemplateLiteral':
      return node.quasis[0].value.cooked
    case 'BinaryExpression':
      return (
        getLiteralValue(path.get('left')) +
        getLiteralValue(path.get('right'))
      )
    default:
      return node.value
  }
}

exports.getLiteralsFromObjectExpression = getLiteralsFromObjectExpression
function getLiteralsFromObjectExpression (path) {
  return path.get('properties').reduce(function (props, prop) {
    var canGetValue = (
      (
        prop.isObjectProperty({ computed: false }) ||
        prop.get('key').isStringLiteral()
      ) &&
      isLiteralish(prop.get('value'))
    )
    if (canGetValue) {
      var key = prop.node.key.name || prop.node.key.value
      props[key] = getLiteralValue(prop.get('value'))
    }
    return props
  }, {})
}

exports.getMessageDetails = getMessageDetails
function getMessageDetails (args) {
  var message = args[0]
  if (message && isLiteralish(message)) {
    return { default: getLiteralValue(message) }
  }
  if (message && message.isObjectExpression()) {
    return getLiteralsFromObjectExpression(message)
  }
  return {}
}

exports.getLiteralParams = getLiteralParams
function getLiteralParams (args) {
  var params = args[1]
  if (params && params.isObjectExpression()) {
    return getLiteralsFromObjectExpression(params)
  }
  return {}
}

exports.getTargetLocale = getTargetLocale
function getTargetLocale (args) {
  var locale = args[2]
  if (locale && isLiteralish(locale)) {
    return getLiteralValue(locale)
  }
  return null
}
