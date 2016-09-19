'use strict'

var util = require('./index')

exports.isTranslatableElement = isTranslatableElement
function isTranslatableElement (path) {
  return hasTranslateAttribute(path, { value: 'yes' })
}

exports.hasTranslateAttribute = hasTranslateAttribute
function hasTranslateAttribute (path, value) {
  var translate = getAttribute(path, 'translate')
  return (
    translate &&
    translate.isStringLiteral(value)
  )
}

exports.getTargetLocale = getTargetLocale
function getTargetLocale (path, value) {
  var lang = getAttribute(path, 'lang')
  return (
    lang &&
    lang.isStringLiteral(value) &&
    lang.node.value
  )
}

exports.getAttribute = getAttribute
function getAttribute (path, name) {
  if (!path.isJSXElement()) return
  var attrs = path.get('openingElement.attributes') || []
  var attrPath = attrs.filter(function (attribute) {
    return attribute.get('name').isJSXIdentifier({ name: name })
  })[0]
  return attrPath && attrPath.get('value')
}

exports.getAttributes = getAttributes
function getAttributes (path) {
  if (!path.isJSXElement()) return
  var attrs = path.get('openingElement.attributes') || []
  var map = {}
  attrs.forEach(function (attribute) {
    if (attribute.get('name').isJSXIdentifier()) {
      map[attribute.get('name').node.name] = attribute.get('value')
    }
  })
  return map
}

exports.getAttributeMessageDetails = getAttributeMessageDetails
function getAttributeMessageDetails (path) {
  var valuePath = path.get('value')
  if (valuePath.isStringLiteral()) {
    return { default: valuePath.node.value }
  }
}

exports.getElementMessageDetails = getElementMessageDetails
function getElementMessageDetails (path) {
  var i = 0
  var wrapperChars = '_*'
  var indirectChars = '⬖⬗⬘⬙⬥⬦⬧⬨⬩⬪⬫' // misc diamonds unlikely to be in a normal message
  var indirect = indirectChars.length
  var wrappers = {}
  function nextToken (path) {
    var char = wrapperChars[i % wrapperChars.length]
    var length = Math.ceil(++i / wrapperChars.length)
    var token = ''
    while (length--) token += char
    wrappers[token] = path.node
    return token
  }
  nextToken.indirect = function (path) {
    var char = indirectChars[indirect % indirectChars.length]
    var length = Math.ceil(++indirect / indirectChars.length)
    var token = ''
    while (length--) token += char
    wrappers[token] = path.node
    return token
  }

  var parameters = {}
  return {
    default: getMessageText(path, nextToken, parameters),
    wrappers: wrappers,
    parameters: parameters
  }
}

exports.getMessageText = getMessageText
function getMessageText (path, nextToken, parameters) {
  return path.get('children').reduce(function (message, child) {
    if (child.isJSXText()) {
      return message + child.node.value
    }
    if (child.isJSXExpressionContainer()) {
      return message + getParameterText(child.get('expression'), nextToken, parameters)
    }
    if (child.isJSXElement()) {
      return message + getChildMessageText(child, nextToken, parameters)
    }
    return message
  }, '')
}

exports.getParameterText = getParameterText
function getParameterText (path, nextToken, parameters) {
  if (path.isStringLiteral()) {
    return path.node.value
  }
  var parameterText = getParameterFromHelper(path, nextToken, parameters)
  if (parameterText) {
    return parameterText
  }
  var name = getCodeSlug(path)
  parameters[name] = path.node
  return '{ ' + name + ' }'
}

exports.getCodeSlug = getCodeSlug
function getCodeSlug (path) {
  // adapted from https://github.com/jenseng/react-i18nliner
  return path.getSource()
    .replace(/<[^>]*>/, '') // remove jsx tags
    .replace(/(this|state|props)\./g, '') // remove common objects
    .replace(/([A-Z]+)?([A-Z])/g, '$1 $2') // add spaces for consective capitals
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ') // remove non-ascii
    .trim()
    .replace(/\s+/g, '_')
}

exports.getChildMessageText = getChildMessageText
function getChildMessageText (path, nextToken, parameters) {
  var token
  var children = path.get('children')
  var hasSubContent = (
    children && children.length > 0 &&
    !hasTranslateAttribute(path)
  )
  if (!hasSubContent) {
    var name = getElementSlug(path)
    token = nextToken.indirect(path)
    parameters[name] = {
      originalElement: path.node,
      value: token + ' ' + token
    }
    return '{ ' + name + ' }'
  }

  token = nextToken(path)
  var innerText = getMessageText(path, nextToken, parameters)
  var pre = token
  var post = token
  if (pre.slice(-1) === innerText[0]) pre = pre + ' '
  if (post[0] === innerText.slice(-1)) post = ' ' + post

  return pre + innerText + post
}

exports.getElementSlug = getElementSlug
function getElementSlug (path) {
  var attrs = getAttributes(path)
  return (
    attrs.key && attrs.key.isStringLiteral() && attrs.key.node.value ||
    attrs.id && attrs.id.isStringLiteral() && attrs.id.node.value ||
    attrs.className && attrs.className.isStringLiteral() && attrs.className.node.value ||
    getCodeSlug(path.get('openingElement.name'))
  )
}

exports.getParameterFromHelper = getParameterFromHelper
function getParameterFromHelper (path, nextToken, parameters) {
  if (!path.isCallExpression()) return
  var name = getHelperFunctionName(path.get('callee'))
  if (!name) return

  var args = path.get('arguments')
  if (args.length < 1) return
  var id = getCodeSlug(args[0])
  var parameter = id + ', ' + name

  if (name === 'number' || name === 'date' || name === 'time') {
    if (args[1] && args[1].isStringLiteral()) {
      parameter += ', ' + args[1].node.value
    }
    parameters[id] = args[0].node
    return '{ ' + parameter + ' }'
  }

  var options
  if (name === 'select') {
    if (args.length < 2) return
    options = getOptionsFromObjectExpression(args[1], nextToken, parameters)
    if (!options) return
    parameters[id] = args[0].node
    return '{ ' + parameter + ', ' + options + ' }'
  }

  if (name === 'plural' || name === 'selectordinal') {
    if (args.length < 2) return
    var hasOffset = args[1].isNumericLiteral()
    options = getOptionsFromObjectExpression(args[hasOffset ? 2 : 1], nextToken, parameters)
    if (!options) return
    if (hasOffset) {
      options = 'offset:' + args[1].node.value + options
    }
    parameters[id] = args[0].node
    return '{ ' + parameter + ', ' + options + ' }'
  }
}

exports.getOptionsFromObjectExpression = getOptionsFromObjectExpression
function getOptionsFromObjectExpression (path, nextToken, parameters) {
  if (!path.isObjectExpression()) return
  var options = ''
  var properties = path.get('properties')
  for (var p = 0, pp = properties.length; p < pp; ++p) {
    var property = properties[p]
    if (!property.isProperty({ computed: false, shorthand: false, method: false })) return
    var key = property.get('key').node.name || property.get('key').node.value
    var valuePath = property.get('value')
    var value
    if (valuePath.isJSXElement()) {
      value = getChildMessageText(valuePath, nextToken, parameters)
    } else if (valuePath.isStringLiteral()) {
      value = valuePath.node.value
    }
    if (value == null) return
    options += '\n' + key + ' {' + value + '}'
  }
  return options
}

exports.getHelperFunctionName = getHelperFunctionName
function getHelperFunctionName (path) {
  var binding
  var name
  var isImportedCall = (
    path.isIdentifier() &&
    (binding = path.scope.getBinding(path.node.name)) &&
    (name = getImportHelper(binding.path)) ||
    (name = getRequireHelper(binding.path, path.node.name))
  )
  if (isImportedCall) return name

  var isMemberCall = (
    path.isMemberExpression() &&
    util.isFormatMessage(path.get('object')) &&
    path.get('property').isIdentifier() &&
    (name = path.get('property').node.name) &&
    isHelperName(name)
  )
  if (isMemberCall) return name
}

exports.getImportHelper = getImportHelper
function getImportHelper (path) {
  var name
  var isImportHelper = (
    (
      path.isImportSpecifier() &&
      path.get('imported').isIdentifier() &&
      (name = path.get('imported').node.name) &&
      isHelperName(name)
    ) && path.parentPath.get('source')
      .isStringLiteral({ value: 'format-message' })
  )
  if (isImportHelper) return name
}

exports.getRequireHelper = getRequireHelper
function getRequireHelper (path, referenceName) {
  function isRequireFormatMessage (path) {
    var arg
    return (
      path.isCallExpression() &&
      path.get('callee').isIdentifier({ name: 'require' }) &&
      !!(arg = path.get('arguments')[0]) &&
      arg.isStringLiteral({ value: 'format-message' })
    )
  }

  var name
  var isMemberRequire = (
    path.isVariableDeclarator() &&
    path.get('id').isIdentifier() &&
    path.get('init').isMemberExpression() &&
    isRequireFormatMessage(path.get('init.object')) &&
    path.get('init.property').isIdentifier() &&
    (name = path.get('init.property').node.name) &&
    isHelperName(name)
  )
  if (isMemberRequire) return name

  var isDestructureRequire = (
    path.isVariableDeclarator() &&
    isRequireFormatMessage(path.get('init')) &&
    path.get('id').isObjectPattern() &&
    path.get('id.properties').some(function (property) {
      var isAHelper = (
        property.get('key').isIdentifier() &&
        isHelperName(property.get('key').node.name)
      )
      if (!isAHelper) return false
      if (property.get('value').isIdentifier({ name: referenceName })) {
        name = property.get('key').node.name
        return true
      }
      return false
    })
  )
  if (isDestructureRequire) return name
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
