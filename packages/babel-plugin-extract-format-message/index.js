'use strict'

var fs = require('fs')
var util = require('format-message-estree-util')
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
    var sortedMessages = Object.keys(messages).sort().reduce(function (sorted, key) {
      sorted[key] = messages[key]
      return sorted
    }, {})

    if (!format) {
      format = outFile ? outFile.slice(outFile.indexOf('.') + 1) : 'json'
    }
    switch (format.toLowerCase()) {
      case 'yaml':
      case 'yml':
      case 'rails':
        return simpleYml(locale, sortedMessages)
      case 'js':
      case 'javascript':
      case 'commonjs':
      case 'node':
        return 'module.exports = ' + JSON.stringify(sortedMessages, null, 2) + '\n'
      case 'es6':
        return 'export default ' + JSON.stringify(sortedMessages, null, 2) + '\n'
      case 'json':
      default:
        return JSON.stringify(sortedMessages, null, 2)
    }
  }

  function writeFile () {
    if (outFile) {
      fs.writeFileSync(outFile, getFileContent(), 'utf8')
    } else {
      process.stdout.write(getFileContent())
    }

    // clean up for subsequent calls (tests)
    messages = {}
    outFile = null
    format = null
    locale = 'en'
    clearTimeout(timer)
    timer = null
  }

  function addMessage (path, state, message) {
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
        util.setBabelContext(path, state)
        if (!util.isFormatMessage(path.node.callee) && !util.isRichMessage(path.node.callee)) return
        var message = util.getMessageDetails(path.node.arguments)
        if (!message || !message.default) return
        addMessage(path, state, message)
      },

      JSXElement: function (path, state) {
        util.setBabelContext(path, state)
        if (!util.isTranslatableElement(path.node)) return
        var message = util.getElementMessageDetails(path.node)
        if (!message || !message.default) return
        addMessage(path, state, message)
      }
    }
  }
}
