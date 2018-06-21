// @flow
'use strict'

/**
 * This function runs through the message looking for tokens. When it finds a
 * token matching a wrapper, it will replace the token with the wrapper, keeping
 * any children intact.
 */
module.exports = function formatChildren (
  applyChildren/*: (string, any, ?mixed[]) => any */,
  message/*: string */,
  wrappers/*: Object */
) {
  if (process.env.NODE_ENV !== 'production' && typeof console === 'object') {
    console.warn(
      'Warning: formatChildren() is deprecated. Use formatMessage.rich() instead.\n' +
      'https://github.com/format-message/format-message/tree/master/packages/format-message' +
      '#formatmessagerichpattern-args-locales'
    )
  }
  wrappers = wrappers || []

  // at least one word character (letter, digit, or _) surrounded by < >
  var wrappingToken = /<(\w+)>/g

  // at least one word character (letter, digit, or _) surrounded by < />
  var selfClosingToken = /<(\w+)\/>/g

  var results = []
  var match, token, i, split, result

  // check that wrapping tokens are properly nested
  var tokens = []
  while ((match = wrappingToken.exec(message))) {
    var key = match[1]
    token = {
      key: key,
      start: match.index,
      end: message.indexOf('</' + key + '>')
    }

    tokens.forEach(function (t) {
      // a token is properly nested if its start tag is within another tokens
      // start and end tag and if its end tag is inside the other tokens end tag
      if (token.start > t.start && token.start < t.end && token.end > t.end) {
        throw new Error('Wrapping tags not properly nested in "' + message + '"')
      }
    })

    tokens.push(token)
  }

  // replace wrapper tokens
  for (i = tokens.length - 1; i >= 0; --i) {
    token = tokens[i]

    if (wrappers[token.key]) {
      // get the text in between the token
      var start = message.lastIndexOf('<' + token.key + '>')
      var end = message.lastIndexOf('</' + token.key + '>')
      var value = message.substring(start + token.key.length + 2, end)

      var children = []

      // add all children between the token, replacing any self closing tokens
      // (which will be the odd index of the split)
      split = value.split(selfClosingToken)
      for (var j = 0; j < split.length; ++j) {
        result = split[j]

        if (j % 2 === 1 && wrappers[result]) {
          children.push(wrappers[result])
        } else if (result) {
          children.push(result)
        }
      }

      // replace the wrapper token with a self closing token in the message to
      // signify the replacement has been done. this also will allow a parent
      // token to add this token as a child
      wrappers['__' + i + '__'] = applyChildren(token.key, wrappers[token.key], children)

      var left = message.substring(0, start)
      var right = message.substring(end + token.key.length + 3)
      message = left + '<__' + i + '__/>' + right
    }
  }

  // replace self closing tokens
  split = message.split(selfClosingToken)
  for (i = 0; i < split.length; ++i) {
    result = split[i]

    if (i % 2 === 1 && wrappers[result]) {
      // don't call applyChildren to a wrapped tag replacement as it was already done
      if (result.indexOf('__') === 0 && result.lastIndexOf('__') === result.length - 2) {
        results.push(wrappers[result])
      } else {
        results.push(applyChildren(result, wrappers[result], null))
      }
    } else if (result) {
      results.push(result)
    }
  }

  return results.length === 1 ? results[0] : results
}
