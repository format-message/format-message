'use strict'

/**
 * This function runs through the message looking for tokens. As it finds a
 * token matching a wrapper, it pushes the parent in the tree on a stack, and
 * collects children for that wrapper until the ending token is found.
 */
module.exports = function formatChildren (applyChildren, message, wrappers) {
  var mm = message.length
  var stack = []
  var current = []
  var currentKey
  var curlyDepth = 0
  var keys = Object.keys(wrappers || {}).sort(function (a, b) {
    return b.length - a.length // longest first
  })
  var kk = keys.length
  var last = 0
  for (var m = 0; m < mm; ++m) {
    if (message[m] === '{') ++curlyDepth
    if (message[m] === '}') --curlyDepth
    if (curlyDepth % 2 === 1) continue

    for (var k = 0; k < kk; ++k) {
      var key = keys[k]
      if (message.slice(m, m + key.length) === key) {
        if (currentKey === key) { // end token
          var end = m
          if (message.slice(m - 1, m) === ' ') {
            --end // skip trailing space inside tag
          }
          if (last < end) {
            current.push(message.slice(last, end))
          }
          var children = current
          current = stack.pop()
          currentKey = stack.pop()
          current.push(applyChildren(wrappers[key], children))
        } else { // start token
          if (last < m) {
            current.push(message.slice(last, m))
          }
          stack.push(currentKey)
          stack.push(current)
          currentKey = key
          current = []
          if (message.slice(m + key.length, m + key.length + 1) === ' ') {
            ++m // skip leading space inside tag
          }
        }
        last = m + key.length
        m = last - 1 // offset next ++
        break
      }
    }
  }
  if (stack.length > 0) {
    throw new Error('Wrapping tokens not properly nested in "' + message + '"')
  }
  if (last < m) {
    current.push(message.slice(last, m))
  }
  return current.length === 1 ? current[0] : current
}
