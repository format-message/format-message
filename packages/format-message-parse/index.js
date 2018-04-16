// @flow
'use strict'

/*::
export type AST = Element[]
export type Element = string | Placeholder
export type Placeholder = Plural | Styled | Typed | Simple
export type Plural = [ string, 'plural' | 'selectordinal', number, SubMessages ]
export type Styled = [ string, string, string | SubMessages ]
export type Typed = [ string, string ]
export type Simple = [ string ]
export type SubMessages = { [string]: AST }
export type Token = [ TokenType, string ]
export type TokenType = 'text' | 'space' | 'id' | 'type' | 'style' | 'offset' | 'number' | 'selector' | 'syntax'
type Context = {|
  pattern: string,
  index: number,
  tagsType: ?string,
  tokens: ?Token[]
|}
*/

const ARG_OPN = '{'
const ARG_CLS = '}'
const ARG_SEP = ','
const NUM_ARG = '#'
const TAG_OPN = '<'
const TAG_CLS = '>'
const TAG_END = '</'
const TAG_SELF_CLS = '/>'
const ESC = '\''
const OFFSET = 'offset:'
const simpleTypes = [
  'number',
  'date',
  'time',
  'ordinal',
  'duration',
  'spellout'
]
const submTypes = [
  'plural',
  'select',
  'selectordinal'
]

/**
 * parse
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
 *
 * tokens:
 *  [
 *    [ "text", "You have " ],
 *    [ "syntax", "{" ],
 *    [ "space", " " ],
 *    [ "id", "numBananas" ],
 *    [ "syntax", ", " ],
 *    [ "space", " " ],
 *    [ "type", "plural" ],
 *    [ "syntax", "," ],
 *    [ "space", "\n     " ],
 *    [ "selector", "=0" ],
 *    [ "space", " " ],
 *    [ "syntax", "{" ],
 *    [ "text", "no bananas" ],
 *    [ "syntax", "}" ],
 *    [ "space", "\n    " ],
 *    [ "selector", "one" ],
 *    [ "space", " " ],
 *    [ "syntax", "{" ],
 *    [ "text", "a banana" ],
 *    [ "syntax", "}" ],
 *    [ "space", "\n  " ],
 *    [ "selector", "other" ],
 *    [ "space", " " ],
 *    [ "syntax", "{" ],
 *    [ "syntax", "#" ],
 *    [ "text", " bananas" ],
 *    [ "syntax", "}" ],
 *    [ "space", "\n" ],
 *    [ "syntax", "}" ],
 *    [ "text", " for sale." ]
 *  ]
 **/
exports = module.exports = function parse (
  pattern/*: string */,
  options/*:: ?: { tagsType?: string, tokens?: Token[] } */
)/*: AST */ {
  return parseAST({
    pattern: String(pattern),
    index: 0,
    tagsType: (options && options.tagsType) || null,
    tokens: (options && options.tokens) || null
  }, '')
}

function parseAST (current/*: Context */, parentType/*: string */)/*: AST */ {
  const pattern = current.pattern
  const length = pattern.length
  const elements/*: AST */ = []
  const start = current.index
  const text = parseText(current, parentType)
  if (text) elements.push(text)
  if (text && current.tokens) current.tokens.push([ 'text', pattern.slice(start, current.index) ])
  while (current.index < length) {
    if (pattern[current.index] === ARG_CLS) {
      if (!parentType) throw expected(current)
      break
    }
    if (parentType && current.tagsType && pattern.slice(current.index, current.index + TAG_END.length) === TAG_END) break
    elements.push(parsePlaceholder(current))
    const start = current.index
    const text = parseText(current, parentType)
    if (text) elements.push(text)
    if (text && current.tokens) current.tokens.push([ 'text', pattern.slice(start, current.index) ])
  }
  return elements
}

function parseText (current/*: Context */, parentType/*: string */)/*: string */ {
  const pattern = current.pattern
  const length = pattern.length
  const isHashSpecial = (parentType === 'plural' || parentType === 'selectordinal')
  const isAngleSpecial = !!current.tagsType
  const isArgStyle = (parentType === '{style}')
  let text = ''
  while (current.index < length) {
    let char = pattern[current.index]
    if (
      char === ARG_OPN || char === ARG_CLS ||
      (isHashSpecial && char === NUM_ARG) ||
      (isAngleSpecial && char === TAG_OPN) ||
      (isArgStyle && isWhitespace(char.charCodeAt(0)))
    ) {
      break
    } else if (char === ESC) {
      char = pattern[++current.index]
      if (char === ESC) { // double is always 1 '
        text += char
        ++current.index
      } else if (
        // only when necessary
        char === ARG_OPN || char === ARG_CLS ||
        (isHashSpecial && char === NUM_ARG) ||
        (isAngleSpecial && char === TAG_OPN) ||
        isArgStyle
      ) {
        text += char
        while (++current.index < length) {
          char = pattern[current.index]
          if (char === ESC && pattern[current.index + 1] === ESC) { // double is always 1 '
            text += ESC
            ++current.index
          } else if (char === ESC) { // end of quoted
            ++current.index
            break
          } else {
            text += char
          }
        }
      } else { // lone ' is just a '
        text += ESC
        // already incremented
      }
    } else {
      text += char
      ++current.index
    }
  }
  return text
}

function isWhitespace (code/*: number */)/*: boolean */ {
  return (
    (code >= 0x09 && code <= 0x0D) ||
    code === 0x20 || code === 0x85 || code === 0xA0 || code === 0x180E ||
    (code >= 0x2000 && code <= 0x200D) ||
    code === 0x2028 || code === 0x2029 || code === 0x202F || code === 0x205F ||
    code === 0x2060 || code === 0x3000 || code === 0xFEFF
  )
}

function skipWhitespace (current/*: Context */)/*: void */ {
  const pattern = current.pattern
  const length = pattern.length
  const start = current.index
  while (current.index < length && isWhitespace(pattern.charCodeAt(current.index))) {
    ++current.index
  }
  if (start < current.index && current.tokens) {
    current.tokens.push([ 'space', current.pattern.slice(start, current.index) ])
  }
}

function parsePlaceholder (current/*: Context */)/*: Placeholder */ {
  const pattern = current.pattern
  if (pattern[current.index] === NUM_ARG) {
    if (current.tokens) current.tokens.push([ 'syntax', NUM_ARG ])
    ++current.index // move passed #
    return [ NUM_ARG ]
  }

  const tag = parseTag(current)
  if (tag) return tag

  /* istanbul ignore if should be unreachable if parseAST and parseText are right */
  if (pattern[current.index] !== ARG_OPN) throw expected(current, ARG_OPN)
  if (current.tokens) current.tokens.push([ 'syntax', ARG_OPN ])
  ++current.index // move passed {
  skipWhitespace(current)

  const id = parseId(current)
  if (!id) throw expected(current, 'placeholder id')
  if (current.tokens) current.tokens.push([ 'id', id ])
  skipWhitespace(current)

  let char = pattern[current.index]
  if (char === ARG_CLS) { // end placeholder
    if (current.tokens) current.tokens.push([ 'syntax', ARG_CLS ])
    ++current.index // move passed }
    return [ id ]
  }

  if (char !== ARG_SEP) throw expected(current, ARG_SEP + ' or ' + ARG_CLS)
  if (current.tokens) current.tokens.push([ 'syntax', ARG_SEP ])
  ++current.index // move passed ,
  skipWhitespace(current)

  const type = parseId(current)
  if (!type) throw expected(current, 'placeholder type')
  if (current.tokens) current.tokens.push([ 'type', type ])
  skipWhitespace(current)
  char = pattern[current.index]
  if (char === ARG_CLS) { // end placeholder
    if (current.tokens) current.tokens.push([ 'syntax', ARG_CLS ])
    if (type === 'plural' || type === 'selectordinal' || type === 'select') {
      throw expected(current, type + ' sub-messages')
    }
    ++current.index // move passed }
    return [ id, type ]
  }

  if (char !== ARG_SEP) throw expected(current, ARG_SEP + ' or ' + ARG_CLS)
  if (current.tokens) current.tokens.push([ 'syntax', ARG_SEP ])
  ++current.index // move passed ,
  skipWhitespace(current)

  let arg
  if (type === 'plural' || type === 'selectordinal') {
    const offset = parsePluralOffset(current)
    skipWhitespace(current)
    arg = [ id, type, offset, parseSubMessages(current, type) ]
  } else if (type === 'select') {
    arg = [ id, type, parseSubMessages(current, type) ]
  } else if (simpleTypes.indexOf(type) >= 0) {
    arg = [ id, type, parseSimpleFormat(current) ]
  } else { // custom placeholder type
    const index = current.index
    let format/*: string | SubMessages */ = parseSimpleFormat(current)
    skipWhitespace(current)
    if (pattern[current.index] === ARG_OPN) {
      current.index = index // rewind, since should have been submessages
      format = parseSubMessages(current, type)
    }
    arg = [ id, type, format ]
  }

  skipWhitespace(current)
  if (pattern[current.index] !== ARG_CLS) throw expected(current, ARG_CLS)
  if (current.tokens) current.tokens.push([ 'syntax', ARG_CLS ])
  ++current.index // move passed }
  return arg
}

function parseTag (current/*: Context */)/*: ?Placeholder */ {
  const tagsType = current.tagsType
  if (!tagsType || current.pattern[current.index] !== TAG_OPN) return

  if (current.pattern.slice(current.index, current.index + TAG_END.length) === TAG_END) {
    throw expected(current, null, 'closing tag without matching opening tag')
  }
  if (current.tokens) current.tokens.push([ 'syntax', TAG_OPN ])
  ++current.index // move passed <

  const id = parseId(current, true)
  if (!id) throw expected(current, 'placeholder id')
  if (current.tokens) current.tokens.push([ 'id', id ])
  skipWhitespace(current)

  if (current.pattern.slice(current.index, current.index + TAG_SELF_CLS.length) === TAG_SELF_CLS) {
    if (current.tokens) current.tokens.push([ 'syntax', TAG_SELF_CLS ])
    current.index += TAG_SELF_CLS.length
    return [ id, tagsType ]
  }
  if (current.pattern[current.index] !== TAG_CLS) throw expected(current, TAG_CLS)
  if (current.tokens) current.tokens.push([ 'syntax', TAG_CLS ])
  ++current.index // move passed >

  const children = parseAST(current, tagsType)

  const end = current.index
  if (current.pattern.slice(current.index, current.index + TAG_END.length) !== TAG_END) throw expected(current, TAG_END + id + TAG_CLS)
  if (current.tokens) current.tokens.push([ 'syntax', TAG_END ])
  current.index += TAG_END.length
  const closeId = parseId(current, true)
  if (closeId && current.tokens) current.tokens.push([ 'id', closeId ])
  if (id !== closeId) {
    current.index = end // rewind for better error message
    throw expected(current, TAG_END + id + TAG_CLS, TAG_END + closeId + TAG_CLS)
  }
  skipWhitespace(current)
  if (current.pattern[current.index] !== TAG_CLS) throw expected(current, TAG_CLS)
  if (current.tokens) current.tokens.push([ 'syntax', TAG_CLS ])
  ++current.index // move passed >

  return [ id, tagsType, { children: children } ]
}

function parseId (current/*: Context */, isTag/*:: ?: boolean */)/*: string */ {
  const pattern = current.pattern
  const length = pattern.length
  let id = ''
  while (current.index < length) {
    const char = pattern[current.index]
    if (
      char === ARG_OPN || char === ARG_CLS || char === ARG_SEP ||
      char === NUM_ARG || char === ESC || isWhitespace(char.charCodeAt(0)) ||
      (isTag && (char === TAG_OPN || char === TAG_CLS || char === '/'))
    ) break
    id += char
    ++current.index
  }
  return id
}

function parseSimpleFormat (current/*: Context */)/*: string */ {
  const start = current.index
  const style = parseText(current, '{style}')
  if (!style) throw expected(current, 'placeholder style name')
  if (current.tokens) current.tokens.push([ 'style', current.pattern.slice(start, current.index) ])
  return style
}

function parsePluralOffset (current/*: Context */)/*: number */ {
  const pattern = current.pattern
  const length = pattern.length
  let offset = 0
  if (pattern.slice(current.index, current.index + OFFSET.length) === OFFSET) {
    if (current.tokens) current.tokens.push([ 'offset', 'offset' ], [ 'syntax', ':' ])
    current.index += OFFSET.length // move passed offset:
    skipWhitespace(current)
    const start = current.index
    while (current.index < length && isDigit(pattern.charCodeAt(current.index))) {
      ++current.index
    }
    if (start === current.index) throw expected(current, 'offset number')
    if (current.tokens) current.tokens.push([ 'number', pattern.slice(start, current.index) ])
    offset = +pattern.slice(start, current.index)
  }
  return offset
}

function isDigit (code/*: number */)/*: boolean */ {
  return (code >= 0x30 && code <= 0x39)
}

function parseSubMessages (current/*: Context */, parentType/*: string */)/*: SubMessages */ {
  const pattern = current.pattern
  const length = pattern.length
  const options/*: SubMessages */ = {}
  while (current.index < length && pattern[current.index] !== ARG_CLS) {
    const selector = parseId(current)
    if (!selector) throw expected(current, 'sub-message selector')
    if (current.tokens) current.tokens.push([ 'selector', selector ])
    skipWhitespace(current)
    options[selector] = parseSubMessage(current, parentType)
    skipWhitespace(current)
  }
  if (!options.other && submTypes.indexOf(parentType) >= 0) {
    throw expected(current, null, null, '"other" sub-message must be specified in ' + parentType)
  }
  return options
}

function parseSubMessage (current/*: Context */, parentType/*: string */)/*: AST */ {
  if (current.pattern[current.index] !== ARG_OPN) throw expected(current, ARG_OPN + ' to start sub-message')
  if (current.tokens) current.tokens.push([ 'syntax', ARG_OPN ])
  ++current.index // move passed {
  const message = parseAST(current, parentType)
  if (current.pattern[current.index] !== ARG_CLS) throw expected(current, ARG_CLS + ' to end sub-message')
  if (current.tokens) current.tokens.push([ 'syntax', ARG_CLS ])
  ++current.index // move passed }
  return message
}

function expected (current/*: Context */, expected/*:: ?: ?string */, found/*:: ?: ?string */, message/*:: ?: string */) {
  const pattern = current.pattern
  const lines = pattern.slice(0, current.index).split(/\r?\n/)
  const offset = current.index
  const line = lines.length
  const column = lines.slice(-1)[0].length
  found = found || (
    (current.index >= pattern.length) ? 'end of message pattern'
      : (parseId(current) || pattern[current.index])
  )
  if (!message) message = errorMessage(expected, found)
  message += ' in ' + pattern.replace(/\r?\n/g, '\n')
  return new SyntaxError(message, expected, found, offset, line, column)
}

function errorMessage (expected/*: ?string */, found/* string */) {
  if (!expected) return 'Unexpected ' + found + ' found'
  return 'Expected ' + expected + ' but found ' + found
}

/**
 * SyntaxError
 *  Holds information about bad syntax found in a message pattern
 **/
function SyntaxError (message/*: string */, expected/*: ?string */, found/*: ?string */, offset/*: number */, line/*: number */, column/*: number */) {
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
