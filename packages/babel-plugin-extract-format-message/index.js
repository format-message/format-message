'use strict'

var fs = require('fs')
var util = require('format-message-babel-util')
var generate = require('format-message-generate-id')
var parse = require('format-message-parse')
var print = require('format-message-print')
var simpleYml = require('./simple-yml')

module.exports = function () {
  function generateId (type, pattern) {
    var fn = typeof type === 'function' ? type
      : generate[type] || generate.underscored_crc32
    return fn(pattern)
  }

  var messages = {}
  var outFile
  var format
  var locale = 'en'
  var timer

  function getFileContent () {
    if (!format) {
      format = outFile ? outFile.slice(outFile.indexOf('.') + 1) : 'json'
    }
    switch (format.toLowerCase()) {
      case 'yaml':
      case 'yml':
      case 'rails':
        return simpleYml(locale, messages)
      case 'js':
      case 'javascript':
      case 'commonjs':
      case 'node':
        return 'module.exports = ' + JSON.stringify(messages, null, 2) + '\n'
      case 'es6':
        return 'export default ' + JSON.stringify(messages, null, 2) + '\n'
      case 'json':
      default:
        return JSON.stringify(messages, null, 2)
    }
  }

  function writeFile () {
    if (outFile) {
      fs.writeFileSync(outFile, getFileContent(), 'utf8')
    } else {
      process.stdout.write(getFileContent())
    }
  }

  return {
    pre: function () {
      clearTimeout(timer)
      timer = null
    },

    post: function () {
      timer = setTimeout(writeFile, 200)
    },

    visitor: {
      Program: function (_, state) {
        if (state.opts.outFile) outFile = state.opts.outFile
        if (state.opts.format) format = state.opts.format
        if (state.opts.locale) locale = state.opts.locale
      },

      CallExpression: function (path, state) {
        if (!util.isFormatMessage(path.get('callee'))) return
        var message = util.getMessageDetails(path.get('arguments'))
        if (!message || !message.default) return

        var pattern = print(parse(message.default)) // pretty format
        var id = message.id || generateId(state.opts.generateId, message.default)
        var description = message.description

        if (!messages[id]) {
          messages[id] = { message: pattern }
        } else if (messages[id].message !== pattern) {
          throw path.buildCodeFrameError(
            'Duplicate message id ' + JSON.stringify(id) +
            ', previously defined as ' + JSON.stringify(messages[id].message),
            RangeError
          )
        }

        if (description && !messages[id].description) {
          messages[id].description = description
        }
      }
    }
  }
}
