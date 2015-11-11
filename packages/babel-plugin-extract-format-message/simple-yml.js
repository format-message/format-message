'use strict'

module.exports = function (locale, messages) {
  return locale + ':' + Object.keys(messages)
    .sort().map(function (key) {
      var message = messages[key].message
      var description = messages[key].description
      var yml = ''

      if (description) {
        yml += '\n  # ' + description.replace(/\r?\n/g, '\n  # ')
      }

      if (/^[a-z0-9_]+$/i.test(key)) {
        yml += '\n  ' + key + ':'
      } else {
        yml += '\n  ' + JSON.stringify(key) + ':'
      }

      if (message.indexOf('\n') >= 0) {
        yml += ' |\n' + '    ' + message.replace(/\r?\n/g, '\n    ')
      } else {
        yml += ' ' + message
      }

      return yml
    }).join('') + '\n'
}
