'use strict'

/**
 * This function runs through the message looking for tokens. As it finds a
 * token matching a wrapper, it pushes the parent in the tree on a stack, and
 * collects children for that wrapper until the ending token is found.
 */
module.exports = function formatChildren (applyChildren, message, wrappers) {
  var invalidChars = '</> \n\t\r'

  if (!wrappers) return message
  var mm = message.length
  var stack = []
  var current = []
  var currentKey
  var curlyDepth = 0
  var last = 0
  for (var m = 0; m < mm; ++m) {
    if (message[m] === '{') ++curlyDepth
    if (message[m] === '}') --curlyDepth
    if (message[m] !== '<' || curlyDepth % 2 === 1) continue

    var isSelfClosing = false
    var isEnd = false

    var s = m + 1 // skip <
    if (message[s] === '/') {
      isEnd = true
      ++s
    }

    var e = s
    while (invalidChars.indexOf(message[e]) < 0) { ++e }
    if (!isEnd && message.slice(e, e + 2) === '/>') {
      isSelfClosing = true
    } else if (message[e] !== '>') {
      throw new Error('Wrapping tags include invalid characters in "' + message + '". Valid characters are any character except `<`, `/`, `>`, and whitespace characters.')
    }

    var key = message.slice(s, e)
    if (!wrappers[key]) continue
    ++e
    if (isSelfClosing) ++e

    if (last < m) {
      current.push(message.slice(last, m))
    }

    if (isSelfClosing) {
      current.push(applyChildren(key, wrappers[key], null))
    } else if (isEnd) {
      if (currentKey !== key) {
        throw new Error('Wrapping tags not properly nested in "' + message + '"')
      }
      var children = current
      current = stack.pop()
      currentKey = stack.pop()
      current.push(applyChildren(key, wrappers[key], children))
    } else { // start token
      stack.push(currentKey)
      stack.push(current)
      currentKey = key
      current = []
    }
    last = e
    m = e - 1 // offset next ++
  }
  if (stack.length > 0) {
    throw new Error('Wrapping tags not properly nested in "' + message + '"')
  }
  if (last < m) {
    current.push(message.slice(last, m))
  }
  return current.length === 1 ? current[0] : current
}
