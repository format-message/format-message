/**
 * Tokens
 *
 * Turns this:
 *  `You have { numBananas, plural,
 *       =0 {no bananas}
 *      one {a banana}
 *    other {# bananas}
 *  } for sale`
 *
 * into this:
 *  [
 *    [ "text", "You have " ],
 *    [ "{", "{" ],
 *    [ "space", " " ],
 *    [ "id", "numBananas" ],
 *    [ ",", ", " ],
 *    [ "space", " " ],
 *    [ "type", "plural" ],
 *    [ ",", "," ],
 *    [ "space", "\n     " ],
 *    [ "selector", "=0" ],
 *    [ "space", " " ],
 *    [ "{", "{" ],
 *    [ "text", "no bananas" ],
 *    [ "}", "}" ],
 *    [ "space", "\n    " ],
 *    [ "selector", "one" ],
 *    [ "space", " " ],
 *    [ "{", "{" ],
 *    [ "text", "a banana" ],
 *    [ "}", "}" ],
 *    [ "space", "\n  " ],
 *    [ "selector", "other" ],
 *    [ "space", " " ],
 *    [ "{", "{" ],
 *    [ "#", "#" ],
 *    [ "text", " bananas" ],
 *    [ "}", "}" ],
 *    [ "space", "\n" ],
 *    [ "}", "}" ],
 *    [ "text", " for sale." ]
 *  ]
 **/

'use strict'

module.exports = function tokens (pattern) {
  var current = { tokens: [], pattern: String(pattern), index: 0 }
  try {
    messageTokens(current, 'message')
    if (current.index < current.pattern.length) {
      throw new Error('Unexpected symbol')
    }
  } catch (error) {
    current.error = error
  }
  return {
    tokens: current.tokens,
    lastIndex: current.index,
    error: current.error
  }
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
  var start = current.index
  var pattern = current.pattern
  var length = pattern.length
  while (
    current.index < length &&
    isWhitespace(pattern[current.index])
  ) {
    ++current.index
  }
  if (start < current.index) {
    current.tokens.push([ 'space', pattern.slice(start, current.index) ])
  }
}

function text (current, parentType) {
  var pattern = current.pattern
  var length = pattern.length
  var isHashSpecial = (parentType === 'plural' || parentType === 'selectordinal')
  var isSpaceSpecial = (parentType === 'style')
  var start = current.index
  var char
  while (current.index < length) {
    char = pattern[current.index]
    if (
      char === '{' ||
      char === '}' ||
      (isHashSpecial && char === '#') ||
      (isSpaceSpecial && isWhitespace(char))
    ) {
      break
    } else if (char === '\'') {
      char = pattern[++current.index]
      if (char === '\'') { // double is always 1 '
        ++current.index
      } else if (
        // only when necessary
        char === '{' ||
        char === '}' ||
        (isHashSpecial && char === '#') ||
        parentType === 'style'
      ) {
        while (++current.index < length) {
          char = pattern[current.index]
          if (pattern.slice(current.index, current.index + 2) === '\'\'') { // double is always 1 '
            ++current.index
          } else if (char === '\'') { // end of quoted
            ++current.index
            break
          }
        }
      } // lone ' is just a '
    } else {
      ++current.index
    }
  }

  return pattern.slice(start, current.index)
}

function argumentTokens (current) {
  var pattern = current.pattern
  var char = pattern[current.index]
  if (char === '#') {
    ++current.index // move passed #
    current.tokens.push([ '#', '#' ])
    return
  }

  if (char === '{') {
    ++current.index // move passed {
    current.tokens.push([ '{', '{' ])
  } else {
    throw new Error('Expected { to start placeholder')
  }

  skipWhitespace(current)

  argId(current)

  skipWhitespace(current)

  char = pattern[current.index]
  if (char === '}') { // end placeholder
    ++current.index
    current.tokens.push([ char, char ])
    return
  } else if (char === ',') {
    ++current.index
    current.tokens.push([ char, char ])
  } else {
    throw new Error('Expected , or }')
  }

  skipWhitespace(current)

  var type = argType(current)

  skipWhitespace(current)

  char = pattern[current.index]
  if (char === '}') { // end placeholder
    ++current.index
    current.tokens.push([ char, char ])
    return
  } else if (char === ',') {
    ++current.index
    current.tokens.push([ char, char ])
  } else {
    throw new Error('Expected , or }')
  }

  skipWhitespace(current)

  if (type === 'plural' || type === 'selectordinal') {
    pluralOffsetTokens(current)
    skipWhitespace(current)
    subMessagesTokens(current, type)
  } else if (type === 'select') {
    subMessagesTokens(current, type)
  } else {
    argStyle(current)
  }

  skipWhitespace(current)

  char = pattern[current.index]
  if (char === '}') { // end placeholder
    ++current.index
    current.tokens.push([ char, char ])
  } else {
    throw new Error('Expected } to end the placeholder')
  }
}

function argId (current) {
  var pattern = current.pattern
  var length = pattern.length
  var start = current.index
  while (current.index < length) {
    var char = pattern[current.index]
    if (
      char === '{' || char === '#' || char === '}' || char === ',' ||
      isWhitespace(char)
    ) {
      break
    }
    ++current.index
  }
  var token = pattern.slice(start, current.index)
  if (token) {
    current.tokens.push([ 'id', token ])
  } else {
    throw new Error('Expected placeholder id')
  }
  return token
}

function argType (current) {
  var pattern = current.pattern
  var token
  var types = [
    'number', 'date', 'time', 'ordinal', 'duration', 'spellout', 'plural', 'selectordinal', 'select'
  ]
  for (var t = 0, tt = types.length; t < tt; ++t) {
    var type = types[t]
    if (pattern.slice(current.index, current.index + type.length) === type) {
      token = type
      current.index += type.length
      break
    }
  }
  if (token) {
    current.tokens.push([ 'type', token ])
  } else {
    throw new Error('Expected placeholder type:\n' + types.join(', '))
  }
  return token
}

function argStyle (current) {
  var token = text(current, 'style')
  if (token) {
    current.tokens.push([ 'style', token ])
  } else {
    throw new Error('Expected a placeholder style name')
  }
  return token
}

function pluralOffsetTokens (current) {
  var pattern = current.pattern
  var length = pattern.length
  if (pattern.slice(current.index, current.index + 7) === 'offset:') {
    current.index += 7 // move passed offset:
    current.tokens.push([ 'offset', 'offset' ])
    current.tokens.push([ ':', ':' ])
    skipWhitespace(current)
    var start = current.index
    while (
      current.index < length &&
      isDigit(pattern[current.index])
    ) {
      ++current.index
    }
    if (start !== current.index) {
      current.tokens.push([ 'number', pattern.slice(start, current.index) ])
    } else {
      throw new Error('Expected offset number')
    }
  }
}

function subMessagesTokens (current, parentType) {
  var pattern = current.pattern
  var length = pattern.length
  var hasSubs = false
  var hasOther = false
  while (
    current.index < length &&
    pattern[current.index] !== '}'
  ) {
    var select = selector(current)
    if (select === 'other') {
      hasOther = true
    }
    skipWhitespace(current)
    subMessageTokens(current, parentType)
    skipWhitespace(current)
    hasSubs = true
  }
  if (!hasSubs) {
    throw new Error('Expected ' + parentType + ' message options')
  } else if (!hasOther) {
    throw new Error('Expected ' + parentType + ' to have an "other" option')
  }
}

function selector (current) {
  var start = current.index
  var pattern = current.pattern
  var length = pattern.length
  while (current.index < length) {
    var char = pattern[current.index]
    if (char === '}' || char === ',' || char === '{' || isWhitespace(char)) {
      break
    }
    ++current.index
  }
  var token = pattern.slice(start, current.index)
  if (token) {
    current.tokens.push([ 'selector', token ])
  } else {
    throw new Error('Expected option selector')
  }
  return token
}

function subMessageTokens (current, parentType) {
  var char = current.pattern[current.index]
  if (char !== '{') {
    throw new Error('Expected { to start sub message')
  }
  ++current.index // move passed {
  current.tokens.push([ char, char ])

  messageTokens(current, parentType)

  char = current.pattern[current.index]
  if (char !== '}') {
    throw new Error('Expected } to end sub message')
  }

  ++current.index // move passed }
  current.tokens.push([ char, char ])
}

function messageTokens (current, parentType) {
  var tokens = current.tokens
  var pattern = current.pattern
  var length = pattern.length
  var token
  if ((token = text(current, parentType))) {
    tokens.push([ 'text', token ])
  }
  while (current.index < length && pattern[current.index] !== '}') {
    argumentTokens(current)
    if ((token = text(current, parentType))) {
      tokens.push([ 'text', token ])
    }
  }
  return tokens
}
