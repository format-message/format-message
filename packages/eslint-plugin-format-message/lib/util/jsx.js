'use strict'

var astUtil = require('./ast')

exports.isTranslatableElement = isTranslatableElement
function isTranslatableElement (node) {
  return hasTranslateAttribute(node, 'yes')
}

exports.hasTranslateAttribute = hasTranslateAttribute
function hasTranslateAttribute (node, value) {
  var translate = getAttribute(node, 'translate')
  return (
    translate &&
    translate.type === 'Literal' &&
    (!value || translate.value === value)
  )
}

exports.getTargetLocale = getTargetLocale
function getTargetLocale (node) {
  var lang = getAttribute(node, 'lang')
  return (
    lang &&
    lang.type === 'Literal' &&
    lang.value
  )
}

exports.getAttribute = getAttribute
function getAttribute (node, name) {
  if (node.type !== 'JSXElement') return
  var attrs = node.openingElement.attributes || []
  var attrNode = attrs.filter(function (attribute) {
    return (
      attribute.name.type === 'JSXIdentifier' &&
      attribute.name.name === name
    )
  })[0]
  return attrNode && attrNode.value
}

exports.getAttributes = getAttributes
function getAttributes (node) {
  if (node.type !== 'JSXElement') return
  var attrs = node.openingElement.attributes || []
  var map = {}
  attrs.forEach(function (attribute) {
    if (attribute.name.type === 'JSXIdentifier') {
      map[attribute.name.name] = attribute.value
    }
  })
  return map
}

exports.getElementMessageDetails = getElementMessageDetails
function getElementMessageDetails (context, node) {
  var i = 0
  var wrapperChars = '_*'
  var indirectChars = '⬖⬗⬘⬙⬥⬦⬧⬨⬩⬪⬫' // misc diamonds unlikely to be in a normal message
  var indirect = indirectChars.length
  var wrappers = {}
  function nextToken (node) {
    var char = wrapperChars[i % wrapperChars.length]
    var length = Math.ceil(++i / wrapperChars.length)
    var token = ''
    while (length--) token += char
    wrappers[token] = node
    return token
  }
  nextToken.indirect = function (node) {
    var char = indirectChars[indirect % indirectChars.length]
    var length = Math.ceil(++indirect / indirectChars.length)
    var token = ''
    while (length--) token += char
    wrappers[token] = node
    return token
  }

  var parameters = {}
  return {
    default: getMessageText(context, node, nextToken, parameters),
    wrappers: wrappers,
    parameters: parameters
  }
}

exports.getMessageText = getMessageText
function getMessageText (context, node, nextToken, parameters) {
  return node.children.reduce(function (message, child) {
    if (child.type === 'JSXText' || child.type === 'Literal') {
      return message + child.value
    }
    if (child.type === 'JSXExpressionContainer') {
      return message + getParameterText(context, child.expression, nextToken, parameters)
    }
    if (child.type === 'JSXElement') {
      return message + getChildMessageText(context, child, nextToken, parameters)
    }
    return message
  }, '')
}

exports.getParameterText = getParameterText
function getParameterText (context, node, nextToken, parameters) {
  if (node.type === 'Literal') {
    return String(node.value)
  }
  var parameterText = getParameterFromHelper(context, node, nextToken, parameters)
  if (parameterText) {
    return parameterText
  }
  var name = getCodeSlug(context, node)
  parameters[name] = node
  return '{ ' + name + ' }'
}

exports.getCodeSlug = getCodeSlug
function getCodeSlug (context, node) {
  // adapted from https://github.com/jenseng/react-i18nliner
  return context.getSourceCode().getText(node)
    .replace(/<[^>]*>/, '') // remove jsx tags
    .replace(/(this|state|props)\./g, '') // remove common objects
    .replace(/([A-Z]+)?([A-Z])/g, '$1 $2') // add spaces for consective capitals
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ') // remove non-ascii
    .trim()
    .replace(/\s+/g, '_')
}

exports.getChildMessageText = getChildMessageText
function getChildMessageText (context, node, nextToken, parameters) {
  var token
  var children = node.children
  var hasSubContent = (
    children && children.length > 0 &&
    !hasTranslateAttribute(node)
  )
  if (!hasSubContent) {
    var name = getElementSlug(context, node)
    token = nextToken.indirect(node)
    parameters[name] = {
      originalElement: node,
      value: token + ' ' + token
    }
    return '{ ' + name + ' }'
  }

  token = nextToken(node)
  var innerText = getMessageText(context, node, nextToken, parameters)
  var pre = token
  var post = token
  if (pre.slice(-1) === innerText[0]) pre = pre + ' '
  if (post[0] === innerText.slice(-1)) post = ' ' + post

  return pre + innerText + post
}

exports.getElementSlug = getElementSlug
function getElementSlug (context, node) {
  var attrs = getAttributes(node)
  return (
    attrs.key && attrs.key.type === 'Literal' && attrs.key.value ||
    attrs.id && attrs.id.type === 'Literal' && attrs.id.value ||
    attrs.className && attrs.className.type === 'Literal' && attrs.className.value ||
    getCodeSlug(context, node.openingElement.name)
  )
}

exports.getParameterFromHelper = getParameterFromHelper
function getParameterFromHelper (context, node, nextToken, parameters) {
  if (node.type !== 'CallExpression') return
  var name = getHelperFunctionName(context, node.callee)
  if (!name) return

  var args = node.arguments
  if (args.length < 1) return
  var id = getCodeSlug(context, args[0])
  var parameter = id + ', ' + name

  if (name === 'number' || name === 'date' || name === 'time') {
    if (args[1] && args[1].type === 'Literal') {
      parameter += ', ' + args[1].value
    }
    parameters[id] = args[0]
    return '{ ' + parameter + ' }'
  }

  var options
  if (name === 'select') {
    if (args.length < 2) return
    options = getOptionsFromObjectExpression(context, args[1], nextToken, parameters)
    if (!options) return
    parameters[id] = args[0]
    return '{ ' + parameter + ', ' + options + ' }'
  }

  if (name === 'plural' || name === 'selectordinal') {
    if (args.length < 2) return
    var hasOffset = args[1].type === 'Literal' && typeof args[1].value === 'number'
    options = getOptionsFromObjectExpression(context, args[hasOffset ? 2 : 1], nextToken, parameters)
    if (!options) return
    if (hasOffset) {
      options = 'offset:' + args[1].value + options
    }
    parameters[id] = args[0]
    return '{ ' + parameter + ', ' + options + ' }'
  }
}

exports.getOptionsFromObjectExpression = getOptionsFromObjectExpression
function getOptionsFromObjectExpression (context, node, nextToken, parameters) {
  if (node.type !== 'ObjectExpression') return
  var options = ''
  var properties = node.properties
  for (var p = 0, pp = properties.length; p < pp; ++p) {
    var property = properties[p]
    if (property.computed || property.shorthand || property.method) return
    var key = property.key.name || property.key.value
    var valueNode = property.value
    var value
    if (valueNode.type === 'JSXElement') {
      value = getChildMessageText(context, valueNode, nextToken, parameters)
    } else if (valueNode.type === 'Literal') {
      value = String(valueNode.value)
    }
    if (value == null) return
    options += '\n' + key + ' {' + value + '}'
  }
  return options
}

exports.getHelperFunctionName = getHelperFunctionName
function getHelperFunctionName (context, node) {
  var binding
  var name
  var isImportedCall = (
    node.type === 'Identifier' &&
    (binding = getBinding(context, node.name)) && (
      (name = getImportHelper(binding.node)) ||
      (name = getRequireHelper(binding.node, node.name))
    )
  )
  if (isImportedCall) return name

  var isMemberCall = (
    node.type === 'MemberExpression' &&
    astUtil.isFormatMessage(context, node.object) &&
    node.property.type === 'Identifier' &&
    (name = node.property.name) &&
    isHelperName(name)
  )
  if (isMemberCall) return name
}

exports.getBinding = getBinding
function getBinding (context, name) {
  var scope = context.getScope()
  var binding
  while (!binding && scope) {
    var ref = scope.variables.filter(function (variable) {
      return variable.name === name
    })[0]
    binding = ref && ref.defs && ref.defs[0]
    scope = scope.upper
  }
  return binding
}

exports.getImportHelper = getImportHelper
function getImportHelper (node) {
  var name
  var isImportHelper = (
    (
      node.type === 'ImportSpecifier' &&
      node.imported.type === 'Identifier' &&
      (name = node.imported.name) &&
      isHelperName(name)
    ) && node.parentnode.source
      .isStringLiteral({ value: 'format-message' })
  )
  if (isImportHelper) return name
}

exports.getRequireHelper = getRequireHelper
function getRequireHelper (node, referenceName) {
  var name
  var isMemberRequire = (
    node.type === 'VariableDeclarator' &&
    node.id.type === 'Identifier' &&
    node.init.type === 'MemberExpression' &&
    isRequireFormatMessage(node.init.object) &&
    node.init.property.type === 'Identifier' &&
    (name = node.init.property.name) &&
    isHelperName(name)
  )
  if (isMemberRequire) return name

  var isDestructureRequire = (
    node.type === 'VariableDeclarator' &&
    isRequireFormatMessage(node.init) &&
    node.id.type === 'ObjectPattern' &&
    node.id.properties.some(function (property) {
      var isAHelper = (
        property.key.type === 'Identifier' &&
        isHelperName(property.key.name)
      )
      if (!isAHelper) return false
      if (property.value.type === 'Identifier' && property.value.name === referenceName) {
        name = property.key.name
        return true
      }
      return false
    })
  )
  if (isDestructureRequire) return name
}

function isRequireFormatMessage (node) {
  var arg
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    !!(arg = node.arguments[0]) &&
    arg.type === 'Literal' &&
    arg.value === 'format-message'
  )
}

exports.isHelperName = isHelperName
function isHelperName (name) {
  return (
    name === 'number' ||
    name === 'date' ||
    name === 'time' ||
    name === 'select' ||
    name === 'plural' ||
    name === 'selectordinal'
  )
}
