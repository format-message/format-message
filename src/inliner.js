import Visitor from './visitor'
import { relative, resolve, basename, join as pathJoin } from 'path'
import recast from 'recast'
import sourceMap from 'source-map'
import Parser from 'message-format/parser'
import { getKeyUnderscoredCrc32 } from './translate-util'
import Transpiler from './transpiler'
const builders = recast.types.builders

/**
 * Transforms source code, translating and inlining `formatMessage` calls
 **/
export default class Inliner extends Visitor {

  constructor (options) {
    super(options)
    this.functions = []
  }

  inline ({ sourceCode, sourceFileName, sourceMapName, inputSourceMap }) {
    this.functions.length = 0
    const ast = this.run({ sourceCode, sourceFileName })
    if (!ast) return { code: sourceCode, map: inputSourceMap }

    ast.program.body = ast.program.body.concat(this.getFunctionsStatements())

    sourceMapName = sourceMapName || (sourceFileName + '.map')
    return this.print({ ast, sourceMapName, inputSourceMap })
  }

  visitFormatCall (path, traverser) {
    traverser.traverse(path) // pre-travserse children
    if (!this.isReplaceable(path)) return

    const node = path.node
    const locale = node.arguments[2] && this.getStringValue(node.arguments[2]) || this.locale
    const params = node.arguments[1]
    const formatName = this.functionName
    const originalPattern = this.getStringValue(node.arguments[0])
    let pattern = this.translate(originalPattern, locale)
    if (pattern == null) {
      pattern = this.handleMissingTranslation(originalPattern, locale, path)
    }
    const patternAst = Parser.parse(pattern)
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

  handleMissingTranslation (originalPattern, locale, path) {
    const replacement = this.missingReplacement || originalPattern
    const message = 'no ' + locale + ' translation found for key ' +
      JSON.stringify(this.getKey(originalPattern))

    if (this.missingTranslation === 'ignore') {
      // do nothing
    } else if (this.missingTranslation === 'warning') {
      this.reportWarning(path, 'Warning: ' + message)
    } else { // 'error'
      this.reportError(path, 'Error: ' + message)
      throw new Error(message)
    }

    return replacement
  }

  getFunctionsStatements () {
    const codeString = this.functions.join('\n')
    const codeAst = recast.parse(codeString)
    this.functions.length = 0
    return codeAst.program.body
  }

  sourceMapComment (path) {
    return '\n//# sourceMappingURL=' + path
  }

  sourceMapInlineComment (map) {
    return this.sourceMapComment(
      'data:application/json;base64,' +
      new Buffer(JSON.stringify(map)).toString('base64')
    )
  }

  static inline (source, options) {
    return new Inliner(options).inline(source)
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

      if (options.sourceMaps === 'inline') {
        result.code += inliner.sourceMapInlineComment(result.map)
      } else if (options.sourceMaps) {
        const mapFileName = outFileName + '.map'
        inliner.emitFile(mapFileName, JSON.stringify(result.map))
        result.code += inliner.sourceMapComment(basename(mapFileName))
      }

      inliner.emitFile(outFileName, result.code, result.map)
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
      code += inliner.sourceMapInlineComment(map)
    } else if (options.sourceMaps) {
      const mapFileName = outFileName + '.map'
      inliner.emitFile(mapFileName, JSON.stringify(map))
      code += inliner.sourceMapComment(basename(mapFileName))
    }

    if (options.outFile) {
      inliner.emitFile(options.outFile, code, map)
    } else {
      inliner.emitResult(code)
    }
  }

}
