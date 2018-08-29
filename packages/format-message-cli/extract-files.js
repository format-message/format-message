'use strict'

var fs = require('fs')
var babel = require('@babel/core')
var plugins = require('./plugins')

module.exports = function extractFiles (files, options) {
  forEachFile(files, function (source) {
    extract(source, options)
  })
}

function forEachFile (files, fn) {
  files.map(function (file) {
    var source = file
    if (typeof file === 'string') {
      source = {
        sourceFileName: file,
        sourceCode: fs.readFileSync(file, 'utf8')
      }
    }
    return source
  }).forEach(fn)
}

function extract (source, options) {
  return babel.transformSync(source.sourceCode, {
    ast: false,
    code: false,
    filename: source.sourceFileName,
    inputSourceMap: source.inputSourceMap,
    sourceRoot: options.root,
    parserOpts: {
      plugins: plugins
    },
    plugins: [
      [ require('babel-plugin-extract-format-message'), options ]
    ]
  })
}
