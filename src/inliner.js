import { readFileSync, writeFileSync } from 'fs'
import { relative, resolve, dirname, basename, join as pathJoin } from 'path'
import mkdirp from 'mkdirp'
import recast from 'recast'
import sourceMap from 'source-map'
import chalk from 'chalk'
import Parser from 'message-format/parser'
import { getTranslate, getGetKey, getKeyNormalized, getKeyUnderscoredCrc32 } from './translate-util'
import Transpiler from './transpiler'
const builders = recast.types.builders
const Literal = recast.types.namedTypes.Literal.toString()
const TemplateLiteral = recast.types.namedTypes.TemplateLiteral.toString()

/**
 * Transforms source code, translating and inlining `formatMessage` calls
 **/
class Inliner {

  constructor (options={}) {
    this.formatName = options.functionName || 'formatMessage'
    this.getKey = getGetKey(options)
    this.translate = getTranslate(options)
    this.translations = options.translations
    this.locale = options.locale || 'en'
    this.functions = []
    this.currentFileName = null
  }

  lint ({ sourceCode, sourceFileName }) {
    this.currentFileName = sourceFileName
    const self = this
    const ast = recast.parse(sourceCode)
    recast.visit(ast, {
      visitCallExpression (path) {
        this.traverse(path) // pre-travserse children
        if (self.isFormatCall(path)) {
          self.lintFormatCall(path)
        }
      }
    })
  }

  lintFormatCall (path) {
    const node = path.node
    let error
    let numErrors = 0
    if (!this.isString(node.arguments[0])) {
      this.reportWarning(path, 'Warning: called without a literal pattern')
      ++numErrors
    }
    if (node.arguments[2] && !this.isString(node.arguments[2])) {
      this.reportWarning(path, 'Warning: called with a non-literal locale')
      ++numErrors
    }

    if (
      this.isString(node.arguments[0])
      && (error = this.getPatternError(this.getStringValue(node.arguments[0])))
    ) {
      this.reportError(path, 'SyntaxError: pattern is invalid', error.message)
      return ++numErrors // can't continue validating pattern
    }

    if (this.isReplaceable(path) && this.translations) {
      const locale = node.arguments[2] ?
        this.getStringValue(node.arguments[2]) :
        this.locale
      const pattern = this.getStringValue(node.arguments[0])
      const translation = this.translate(pattern, locale)
      if (translation == null) {
        this.reportWarning(
          path,
          'Warning: no ' + locale + ' translation found for key ' +
            JSON.stringify(this.getKey(pattern))
        )
        ++numErrors
      } else if ((error = this.getPatternError(translation))) {
        this.reportError(
          path,
          'SyntaxError: ' + locale + ' translated pattern is invalid for key ' +
            JSON.stringify(this.getKey(pattern)),
          error.message
        )
        ++numErrors
      }
    }

    return numErrors
  }

  getLocation (path) {
    return (
      '    at ' + this.formatName + ' (' +
      this.currentFileName + ':' +
      path.node.loc.start.line + ':' +
      path.node.loc.start.column + ')'
    )
  }

  reportWarning (path, message) {
    console.warn(chalk.bold.yellow(message))
    console.warn(chalk.yellow(this.getLocation(path)))
  }

  reportError (path, message, submessage) {
    console.error(chalk.bold.red(message))
    console.error(chalk.red(this.getLocation(path)))
    if (submessage) {
      const sub = '    ' + submessage.replace(/\n/g, '\n    ')
      console.error(chalk.red(sub))
    }
  }

  extract ({ sourceCode, sourceFileName }) {
    this.currentFileName = sourceFileName
    const self = this
    const patterns = {}
    const ast = recast.parse(sourceCode)
    recast.visit(ast, {
      visitCallExpression (path) {
        this.traverse(path) // pre-travserse children
        if (self.isReplaceable(path)) {
          const pattern = self.getStringValue(path.node.arguments[0])
          const error = self.getPatternError(pattern)
          if (error) {
            self.reportError(path, 'SyntaxError: pattern is invalid', error.message)
          } else {
            const key = self.getKey(pattern)
            patterns[key] = getKeyNormalized(pattern)
          }
        }
      }
    })
    return patterns
  }

  inline ({ sourceCode, sourceFileName, sourceMapName, inputSourceMap }) {
    this.functions.length = 0
    const self = this
    const ast = recast.parse(sourceCode, { sourceFileName })
    recast.visit(ast, {
      visitCallExpression (path) {
        this.traverse(path) // pre-travserse children
        if (self.isReplaceable(path)) {
          self.replace(path)
        }
      }
    })
    ast.program.body = ast.program.body.concat(this.getFunctionsStatements())

    sourceMapName = sourceMapName || (sourceFileName + '.map')
    return recast.print(ast, { sourceMapName, inputSourceMap })
  }

  getStringValue (literal) {
    if (literal.type === TemplateLiteral) {
      return literal.quasis[0].value.cooked
    }
    return literal.value
  }

  isFormatCall (path) {
    const node = path.node
    return (
      node.callee.name === this.formatName
    )
  }

  isString (node) {
    return node && (
      node.type === Literal
      && typeof node.value === 'string'
      || (
        node.type === TemplateLiteral
        && node.expressions.length === 0
        && node.quasis.length === 1
      )
    )
  }

  getPatternError (pattern) {
    try {
      Parser.parse(pattern)
    } catch (error) {
      return error
    }
  }

  isReplaceable (path) {
    const node = path.node
    return (
      this.isFormatCall(path)
      // first argument is a literal string, or template literal with no expressions
      && this.isString(node.arguments[0])
      && (
        // no specified locale, or is a literal string
        !node.arguments[2]
        || this.isString(node.arguments[2])
      )
    )
  }

  replace (path) {
    const node = path.node
    const locale = node.arguments[2] && this.getStringValue(node.arguments[2]) || this.locale
    const originalPattern = this.getStringValue(node.arguments[0])
    const pattern = this.translate(originalPattern, locale) || originalPattern
    const patternAst = Parser.parse(pattern)
    const params = node.arguments[1]
    const formatName = this.formatName
    let replacement

    if (patternAst.length === 1 && typeof patternAst[0] === 'string') {
      replacement = builders.literal(patternAst[0])
    } else if (patternAst.length === 0) {
      replacement = builders.literal('')
    } else {
      const functionName = '$$_' + getKeyUnderscoredCrc32(pattern)
      const codeString = Transpiler.transpile(patternAst, { locale, formatName, functionName })
      const calleeExpr = builders.identifier(functionName)
      const otherArguments = [
        params || builders.literal(null)
      ]
      if (this.functions.indexOf(codeString) === -1) {
        this.functions.push(codeString)
      }

      replacement = builders.callExpression(
        calleeExpr, // callee
        otherArguments // arguments
      )
    }

    path.replace(replacement)
  }

  getFunctionsStatements () {
    const codeString = this.functions.join('\n')
    const codeAst = recast.parse(codeString)
    this.functions.length = 0
    return codeAst.program.body
  }

  forEachFile (files, fn, ctx) {
    for (let file of files) {
      let source = file
      if (typeof file === 'string') {
        source = {
          sourceFileName: file,
          sourceCode: readFileSync(file, 'utf8')
        }
      }
      fn.call(ctx, source)
    }
  }

  sourceMapComment (map) {
    return (
      '\n//# sourceMappingURL=data:application/json;base64,' +
      new Buffer(JSON.stringify(map)).toString('base64')
    )
  }

  static lint (source, options) {
    return new Inliner(options).lint(source)
  }

  static extract (source, options) {
    return new Inliner(options).extract(source)
  }

  static inline (source, options) {
    return new Inliner(options).inline(source)
  }

  static lintFiles (files, options) {
    const inliner = new Inliner(options)
    inliner.forEachFile(files, source => inliner.lint(source))
  }

  static extractFromFiles (files, options) {
    const inliner = new Inliner(options)
    const translations = {}
    inliner.forEachFile(files, source => {
      const patterns = inliner.extract(source)
      Object.assign(translations, patterns)
    })
    const json = JSON.stringify({
      [inliner.locale]: translations
    }, null, '  ')
    if (options.outFile) {
      writeFileSync(options.outFile, json, 'utf8')
    } else {
      console.log(json)
    }
  }

  static inlineFiles (files, options) {
    if (options.outDir) {
      Inliner.inlineManyToMany(files, options)
    } else {
      Inliner.inlineManyToOne(files, options)
    }
  }

  static inlineManyToMany (files, options) {
    const inliner = new Inliner(options)
    const root = resolve(options.root)
    const outDir = options.outDir.replace(/\/$/, '') + '/'
    inliner.forEachFile(files, source => {
      const result = inliner.inline(source)
      const outFileName = pathJoin(outDir, relative(root, source.sourceFileName))
      mkdirp.sync(dirname(outFileName))

      if (options.sourceMaps === 'inline') {
        result.code += inliner.sourceMapComment(result.map)
      } else if (options.sourceMaps) {
        const mapFileName = outFileName + '.map'
        writeFileSync(mapFileName, JSON.stringify(result.map), 'utf8')
        result.code += '\n//# sourceMappingURL=' + basename(mapFileName)
      }

      writeFileSync(outFileName, result.code, 'utf8')
    })
  }

  static inlineManyToOne (files, options) {
    const inliner = new Inliner(options)
    const outFileName = options.outFile || options.filename
    const map = new sourceMap.SourceMapGenerator({
      file: outFileName
    })
    let code = ''
    let offset = 0

    inliner.forEachFile(files, source => {
      const result = inliner.inline(source)
      const filename = source.souceFileName
      const consumer = new sourceMap.SourceMapConsumer(result.map)
      map._sources.add(filename)
      map.setSourceContent(filename, source.sourceCode)
      consumer.eachMapping(mapping => {
        map._mappings.add({
          generatedLine: mapping.generatedLine + offset,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          source: filename
        })
      })

      code += result.code + '\n'
      offset = code.split('\n').length
    })

    if (options.sourceMaps === 'inline') {
      code += inliner.sourceMapComment(map)
    } else if (options.sourceMaps) {
      const mapFileName = outFileName + '.map'
      mkdirp.sync(dirname(mapFileName))
      writeFileSync(mapFileName, JSON.stringify(map), 'utf8')
      code += '\n//# sourceMappingURL=' + basename(mapFileName)
    }

    if (options.outFile) {
      mkdirp.sync(dirname(options.outFile))
      writeFileSync(options.outFile, code, 'utf8')
    } else {
      console.log(code)
    }
  }

}

export default Inliner
