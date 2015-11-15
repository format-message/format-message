'use strict'

exports.isImportFormatMessage = isImportFormatMessage
function isImportFormatMessage (node) {
  return (
    node.type === 'ImportDefaultSpecifier' &&
    node.parent.source.type === 'Literal' &&
    node.parent.source.value === 'format-message'
  )
}

exports.isRequireFormatMessage = isRequireFormatMessage
function isRequireFormatMessage (node) {
  var arg
  return (
    node.type === 'VariableDeclarator' &&
    node.init.type === 'CallExpression' &&
    node.init.callee.type === 'Identifier' &&
    node.init.callee.name === 'require' &&
    !!(arg = node.init.arguments[0]) &&
    arg.type === 'Literal' &&
    arg.value === 'format-message'
  )
}

exports.isFormatMessage = isFormatMessage
function isFormatMessage (context, callee) {
  if (callee.type !== 'Identifier') return false
  var scope = context.getScope()
  var binding
  while (!binding && scope) {
    var ref = scope.variables.filter(function (variable) {
      return variable.name === callee.name
    })[0]
    binding = ref && ref.defs && ref.defs[0]
    scope = scope.upper
  }
  if (!binding) return false

  return (
    isImportFormatMessage(binding.node) ||
    isRequireFormatMessage(binding.node)
  )
}

exports.isStringish = isStringish
function isStringish (node) {
  return (
    isLiteralish(node) &&
    typeof getLiteralValue(node) === 'string'
  )
}

exports.isLiteralish = isLiteralish
function isLiteralish (node) {
  return (
    node.type === 'Literal' || (
      node.type === 'TemplateLiteral' &&
      node.expressions.length === 0 &&
      node.quasis.length === 1
    ) || (
      node.type === 'BinaryExpression' &&
      node.operator === '+' &&
      isLiteralish(node.left) &&
      isLiteralish(node.right)
    )
  )
}

exports.getLiteralValue = getLiteralValue
function getLiteralValue (node) {
  // assumes isLiteralish(node) === true
  switch (node.type) {
    case 'NullLiteral':
      return null
    case 'RegExpLiteral':
      return new RegExp(node.regex.pattern, node.regex.flags)
    case 'TemplateLiteral':
      return node.quasis[0].value.cooked
    case 'BinaryExpression':
      return (
        getLiteralValue(node.left) +
        getLiteralValue(node.right)
      )
    default:
      return node.value
  }
}

exports.getLiteralsFromObjectExpression = getLiteralsFromObjectExpression
function getLiteralsFromObjectExpression (node) {
  return node.properties.reduce(function (props, prop) {
    var canGetValue = (
      (
        prop.computed === false ||
        prop.key.type === 'StringLiteral'
      ) &&
      isLiteralish(prop.value)
    )
    if (canGetValue) {
      var key = prop.key.name || prop.key.value
      props[key] = getLiteralValue(prop.value)
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
  if (message && message.type === 'ObjectExpression') {
    return getLiteralsFromObjectExpression(message)
  }
  return {}
}

exports.getLiteralParams = getLiteralParams
function getLiteralParams (args) {
  var params = args[1]
  if (params && params.type === 'ObjectExpression') {
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

exports.getParamsFromPatternAst = getParamsFromPatternAst
function getParamsFromPatternAst (ast) {
  if (!ast || !ast.slice) return []
  var stack = ast.slice()
  var params = []
  while (stack.length) {
    var element = stack.pop()
    if (typeof element === 'string') continue
    if (element.length === 1 && element[0] === '#') continue

    var name = element[0]
    if (params.indexOf(name) < 0) params.push(name)

    var type = element[1]
    if (type === 'select' || type === 'plural' || type === 'selectordinal') {
      var children = type === 'select' ? element[2] : element[3]
      stack = stack.concat.apply(stack,
        Object.keys(children).map(function (key) { return children[key] })
      )
    }
  }
  return params
}
