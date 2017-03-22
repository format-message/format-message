/**
 * Parser
 *
 * Turns this:
 *  `You have { numBananas, plural,
 *       =0 {no bananas}
 *      one {a banana}
 *    other {# bananas}
 *  } for sale`
 *
 * into this:
 *  [ "You have ", [ "numBananas", "plural", 0, {
 *       "=0": [ "no bananas" ],
 *      "one": [ "a banana" ],
 *    "other": [ [ '#' ], " bananas" ]
 *  } ], " for sale." ]
 **/
'use strict'

module.exports = function parse (pattern) {
  if (typeof pattern !== 'string') throw new SyntaxError('Pattern must be a string')
  return parseMessage({ pattern: pattern, index: 0 }, 'message')
}

function isDigit (char) {
  return (
    char === '0' ||
    char === '1' ||
    char === '2' ||
    char === '3' ||
    char === '4' ||
    char === '5' ||
    char === '6' ||
    char === '7' ||
    char === '8' ||
    char === '9'
  )
}

function isWhitespace (char) {
  var code = char && char.charCodeAt(0)
  return (
    (code >= 0x09 && code <= 0x0D) ||
    code === 0x20 || code === 0x85 || code === 0xA0 || code === 0x180E ||
    (code >= 0x2000 && code <= 0x200D) ||
    code === 0x2028 || code === 0x2029 || code === 0x202F || code === 0x205F ||
    code === 0x2060 || code === 0x3000 || code === 0xFEFF
  )
}

function skipWhitespace (current) {
  var pattern = current.pattern
  var length = pattern.length
  while (
    current.index < length &&
    isWhitespace(pattern[current.index])
  ) {
    ++current.index
  }
}

function parseText (current, parentType) {
  var pattern = current.pattern
  var length = pattern.length
  var isHashSpecial = (parentType === 'plural' || parentType === 'selectordinal')
  var isArgStyle = (parentType === 'style')
  var text = ''
  var char
  while (current.index < length) {
    char = pattern[current.index]
    if (
      char === '{' ||
      char === '}' ||
      (isHashSpecial && char === '#') ||
      (isArgStyle && isWhitespace(char))
    ) {
      break
    } else if (char === '\'') {
      char = pattern[++current.index]
      if (char === '\'') { // double is always 1 '
        text += char
        ++current.index
      } else if (
        // only when necessary
        char === '{' ||
        char === '}' ||
        (isHashSpecial && char === '#') ||
        isArgStyle
      ) {
        text += char
        while (++current.index < length) {
          char = pattern[current.index]
          if (pattern.slice(current.index, current.index + 2) === '\'\'') { // double is always 1 '
            text += char
            ++current.index
          } else if (char === '\'') { // end of quoted
            ++current.index
            break
          } else {
            text += char
          }
        }
      } else { // lone ' is just a '
        text += '\''
        // already incremented
      }
    } else {
      text += char
      ++current.index
    }
  }

  return text
}

function parseArgument (current) {
  var pattern = current.pattern
  if (pattern[current.index] === '#') {
    ++current.index // move passed #
    return [ '#' ]
  }

  ++current.index // move passed {
  var id = parseArgId(current)
  var char = pattern[current.index]
  if (char === '}') { // end argument
    ++current.index // move passed }
    return [ id ]
  }
  if (char !== ',') {
    throwExpected(current, ',')
  }
  ++current.index // move passed ,

  var type = parseArgType(current)
  char = pattern[current.index]
  if (char === '}') { // end argument
    if (
      type === 'plural' ||
      type === 'selectordinal' ||
      type === 'select'
    ) {
      throwExpected(current, type + ' message options')
    }
    ++current.index // move passed }
    return [ id, type ]
  }
  if (char !== ',') {
    throwExpected(current, ',')
  }
  ++current.index // move passed ,

  var format
  var offset
  if (type === 'plural' || type === 'selectordinal') {
    offset = parsePluralOffset(current)
    format = parseSubMessages(current, type)
  } else if (type === 'select') {
    format = parseSubMessages(current, type)
  } else {
    format = parseSimpleFormat(current)
  }
  char = pattern[current.index]
  if (char !== '}') { // not ended argument
    throwExpected(current, '}')
  }
  ++current.index // move passed

  return (type === 'plural' || type === 'selectordinal')
    ? [ id, type, offset, format ]
    : [ id, type, format ]
}

function parseArgId (current) {
  skipWhitespace(current)
  var pattern = current.pattern
  var length = pattern.length
  var id = ''
  while (current.index < length) {
    var char = pattern[current.index]
    if (char === '{' || char === '#') {
      throwExpected(current, 'argument id')
    }
    if (char === '}' || char === ',' || isWhitespace(char)) {
      break
    }
    id += char
    ++current.index
  }
  if (!id) {
    throwExpected(current, 'argument id')
  }
  skipWhitespace(current)
  return id
}

function parseArgType (current) {
  skipWhitespace(current)
  var pattern = current.pattern
  var argType
  var types = [
    'number', 'date', 'time', 'ordinal', 'duration', 'spellout', 'plural', 'selectordinal', 'select'
  ]
  for (var t = 0, tt = types.length; t < tt; ++t) {
    var type = types[t]
    if (pattern.slice(current.index, current.index + type.length) === type) {
      argType = type
      current.index += type.length
      break
    }
  }
  if (!argType) {
    throwExpected(current, types.join(', '))
  }
  skipWhitespace(current)
  return argType
}

function parseSimpleFormat (current) {
  skipWhitespace(current)
  var style = parseText(current, 'style')
  if (!style) {
    throwExpected(current, 'argument style name')
  }
  skipWhitespace(current)
  return style
}

function parsePluralOffset (current) {
  skipWhitespace(current)
  var offset = 0
  var pattern = current.pattern
  var length = pattern.length
  if (pattern.slice(current.index, current.index + 7) === 'offset:') {
    current.index += 7 // move passed offset:
    skipWhitespace(current)
    var start = current.index
    while (
      current.index < length &&
      isDigit(pattern[current.index])
    ) {
      ++current.index
    }
    if (start === current.index) {
      throwExpected(current, 'offset number')
    }
    offset = +pattern.slice(start, current.index)
    skipWhitespace(current)
  }
  return offset
}

function parseSubMessages (current, parentType) {
  skipWhitespace(current)
  var pattern = current.pattern
  var length = pattern.length
  var options = {}
  var hasSubs = false
  while (
    current.index < length &&
    pattern[current.index] !== '}'
  ) {
    var selector = parseSelector(current)
    skipWhitespace(current)
    options[selector] = parseSubMessage(current, parentType)
    hasSubs = true
    skipWhitespace(current)
  }
  if (!hasSubs) {
    throwExpected(current, parentType + ' message options')
  }
  if (!('other' in options)) { // does not have an other selector
    throwExpected(current, null, null, '"other" option must be specified in ' + parentType)
  }
  return options
}

function parseSelector (current) {
  var pattern = current.pattern
  var length = pattern.length
  var selector = ''
  while (current.index < length) {
    var char = pattern[current.index]
    if (char === '}' || char === ',') {
      throwExpected(current, '{')
    }
    if (char === '{' || isWhitespace(char)) {
      break
    }
    selector += char
    ++current.index
  }
  if (!selector) {
    throwExpected(current, 'selector')
  }
  skipWhitespace(current)
  return selector
}

function parseSubMessage (current, parentType) {
  var char = current.pattern[current.index]
  if (char !== '{') {
    throwExpected(current, '{')
  }
  ++current.index // move passed {
  var message = parseMessage(current, parentType)
  char = current.pattern[current.index]
  if (char !== '}') {
    throwExpected(current, '}')
  }
  ++current.index // move passed }
  return message
}

function parseMessage (current, parentType) {
  var pattern = current.pattern
  var length = pattern.length
  var text
  var elements = []
  if ((text = parseText(current, parentType))) {
    elements.push(text)
  }
  while (current.index < length) {
    if (pattern[current.index] === '}') {
      if (parentType === 'message') {
        throwExpected(current)
      }
      break
    }
    elements.push(parseArgument(current, parentType))
    if ((text = parseText(current, parentType))) {
      elements.push(text)
    }
  }
  return elements
}

function throwExpected (current, expected, found, message) {
  var pattern = current.pattern
  var lines = pattern.slice(0, current.index).split(/\r?\n/)
  var offset = current.index
  var line = lines.length
  var column = lines.slice(-1)[0].length
  if (!found) {
    if (current.index >= pattern.length) {
      found = 'end of input'
    } else {
      found = pattern[current.index]
      while (++current.index < pattern.length) {
        var char = pattern[current.index]
        // keep going until a non alphanumeric (allow accents)
        if (!isDigit(char) && char.toUpperCase() === char.toLowerCase()) break
        found += char
      }
    }
  }
  if (!message) {
    message = errorMessage(expected, found)
  }
  message += ' in ' + pattern.replace(/\r?\n/g, '\n')

  throw new SyntaxError(message, expected, found, offset, line, column)
}

function errorMessage (expected, found) {
  if (!expected) {
    return 'Unexpected ' + found + ' found'
  }
  return 'Expected ' + expected + ' but ' + found + ' found'
}

/**
 * SyntaxError
 *  Holds information about bad syntax found in a message pattern
 **/
function SyntaxError (message, expected, found, offset, line, column) {
  Error.call(this, message)
  this.name = 'SyntaxError'
  this.message = message
  this.expected = expected
  this.found = found
  this.offset = offset
  this.line = line
  this.column = column
}

SyntaxError.prototype = Object.create(Error.prototype)

module.exports.SyntaxError = SyntaxError
