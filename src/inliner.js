import Visitor from './visitor'
import { relative, resolve, basename, join as pathJoin } from 'path'
import * as babel from 'babel-core'
import sourceMap from 'source-map'
import Parser from 'message-format/parser'
import Transpiler from './transpiler'

const types = babel.types

/**
 * Transforms source code, translating and inlining `formatMessage` calls
 **/
export default class Inliner extends Visitor {

  constructor (options) {
    super(options)
    this.declarations = []
  }

  inline ({ sourceCode, sourceFileName, sourceMapName, inputSourceMap }) {
    this.declarations.length = 0
    return this.run({ sourceCode, sourceFileName, sourceMapName, inputSourceMap })
  }

  exitFormatCall (node, parent, scope, traverser) {
    if (!this.isReplaceable(node)) return

    const originalPattern = this.getStringValue(node.arguments[0])
    const localeArg = node.arguments[2]
    const locale = localeArg && this.getStringValue(localeArg) || this.locale

    const pattern = this.getTranslation(originalPattern, locale, node)
    const patternAst = Parser.parse(pattern)
    const { replacement, declaration } = Transpiler.transpile(patternAst, {
      originalPattern, locale, node, traverser
    })

    this.addDeclaration(declaration)
    traverser.replaceWith(replacement)
  }

  exitTranslateCall (node, parent, scope, traverser) {
    if (!this.isReplaceable(node)) return

    const originalPattern = this.getStringValue(node.arguments[0])
    const localeArg = node.arguments[1]
    const locale = localeArg && this.getStringValue(localeArg) || this.locale

    const pattern = this.getTranslation(originalPattern, locale, node)
    return traverser.replaceWith(types.literal(pattern))
  }

  exitProgram (node) {
    node.body = node.body.concat(this.declarations)
    this.declarations.length = 0
  }

  shouldOutputCode () {
    return true
  }

  getTranslation (originalPattern, locale, node) {
    const pattern = this.translate(originalPattern, locale)
    if (pattern != null) { return pattern }

    const replacement = this.missingReplacement || originalPattern
    const message = 'no ' + locale + ' translation found for key ' +
      JSON.stringify(this.getKey(originalPattern))

    if (this.missingTranslation === 'ignore') {
      // do nothing
    } else if (this.missingTranslation === 'warning') {
      this.reportWarning(node, 'Warning: ' + message)
    } else { // 'error'
      this.reportError(node, 'Error: ' + message)
      throw new Error(message)
    }

    return replacement
  }

  addDeclaration (declaration) {
    if (declaration) {
      const found = this.declarations.some(({ id }) => id === declaration.id)
      if (!found) {
        this.declarations.push(declaration)
      }
    }
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

      if (options.sourceMaps === 'inline' && result.map) {
        result.code += inliner.sourceMapInlineComment(result.map)
      } else if (options.sourceMaps && result.map) {
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
      if (result.map) {
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
      }

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
