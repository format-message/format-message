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
  var keys = Object.keys(wrappers || {}).sort(function (a, b) {
    return b.length - a.length // longest first
  })
  var kk = keys.length
  var last = 0
  for (var m = 0; m < mm; ++m) {
    for (var k = 0; k < kk; ++k) {
      var key = keys[k]
      if (message.slice(m, m + key.length) === key) {
        if (last < m) {
          current.push(message.slice(last, m))
        }
        last = m + key.length
        m = last - 1 // offset next ++
        if (currentKey === key) {
          var children = current
          current = stack.pop()
          currentKey = stack.pop()
          current.push(applyChildren(wrappers[key], children))
        } else {
          stack.push(currentKey)
          stack.push(current)
          currentKey = key
          current = []
        }
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
