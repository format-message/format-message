'use strict'

var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var Buffer = require('safe-buffer').Buffer
var sourceMap = require('source-map')
var babel = require('@babel/core')
var plugins = require('./plugins')

module.exports = function transformFiles (files, options) {
  if (options.outDir) {
    transformManyToMany(files, options)
  } else {
    transformManyToOne(files, options)
  }
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

function sourceMapComment (path) {
  return '\n//# sourceMappingURL=' + path
}

function sourceMapInlineComment (map) {
  return sourceMapComment(
    'data:application/json;base64,' +
    Buffer.from(JSON.stringify(map)).toString('base64')
  )
}

function transformManyToMany (files, options) {
  var root = options.root = path.resolve(options.root)
  var outDir = options.outDir.replace(/\/$/, '') + '/'
  forEachFile(files, function (source) {
    var result = transform(source, options)
    var outFileName = path.join(outDir, path.relative(root, source.sourceFileName))
    mkdirp.sync(path.dirname(outFileName))

    if (options.sourceMaps === 'inline' && result.map) {
      result.code += sourceMapInlineComment(result.map)
    } else if (options.sourceMaps && result.map) {
      var mapFileName = outFileName + '.map'
      fs.writeFileSync(mapFileName, JSON.stringify(result.map), 'utf8')
      result.code += sourceMapComment(path.basename(mapFileName))
    }

    fs.writeFileSync(outFileName, result.code, 'utf8')
  })
}

function transformManyToOne (files, options) {
  var outFileName = options.outFile || options.filename
  var map = new sourceMap.SourceMapGenerator({
    file: outFileName
  })
  var code = ''
  var offset = 0

  forEachFile(files, function (source) {
    var result = transform(source, options)
    var filename = source.souceFileName
    if (result.map) {
      var consumer = new sourceMap.SourceMapConsumer(result.map)
      map._sources.add(filename)
      map.setSourceContent(filename, source.sourceCode)
      consumer.eachMapping(function (mapping) {
        map._mappings.add({
          generatedLine: mapping.generatedLine + offset,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          source: filename
        })
      })
    }

    code += result.code + '\n'
    offset = code.split('\n').length
  })

  if (options.sourceMaps === 'inline') {
    code += sourceMapInlineComment(map)
  } else if (options.sourceMaps) {
    var mapFileName = outFileName + '.map'
    fs.writeFileSync(mapFileName, JSON.stringify(map), 'utf8')
    code += sourceMapComment(path.basename(mapFileName))
  }

  if (options.outFile) {
    fs.writeFileSync(options.outFile, code, 'utf8')
  } else {
    process.stdout.write(code)
  }
}

function transform (source, options) {
  return babel.transformSync(source.sourceCode, {
    ast: false,
    filename: source.sourceFileName,
    inputSourceMap: source.inputSourceMap,
    sourceMaps: options.sourceMaps, // .map
    sourceRoot: options.root,
    parserOpts: {
      plugins: plugins
    },
    plugins: [
      [ require('babel-plugin-transform-format-message'), options ]
    ]
  })
}
