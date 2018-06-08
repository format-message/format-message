'use strict'
var path = require('path')

module.exports = [
  './format-message/index.js',
  './format-message-formats/index.js',
  './format-message-generate-id/literal.js',
  './format-message-generate-id/normalized.js',
  './format-message-generate-id/underscored.js',
  './format-message-generate-id/underscored_crc32.js',
  './format-message-interpret/index.js',
  './format-message-parse/index.js',
  './format-message-print/index.js',
  './lookup-closest-locale/index.js'
].map(function (entry) {
  var dirname = path.resolve(__dirname, 'packages', path.dirname(entry))
  var basename = path.basename(entry)
  var pkg = require(path.join(dirname, 'package.json'))
  return {
    context: dirname,
    devtool: 'source-map',
    entry: './' + basename,
    externals: new RegExp(
      '^(' + Object.keys(pkg.dependencies || {}).join('|') + ')(/|$)'
    ),
    mode: 'production',
    output: {
      filename: 'umd/' + basename.replace(/\.js$/, '.min.js'),
      libraryTarget: 'umd',
      path: dirname
    }
  }
})
