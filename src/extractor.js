import Visitor from './visitor'
import { getKeyNormalized } from './translate-util'

/**
 * Transforms source code, translating and inlining `formatMessage` calls
 **/
export default class Extractor extends Visitor {

  constructor (options) {
    super(options)
    this.patterns = null
  }

  extract ({ sourceCode, sourceFileName }) {
    this.patterns = {}
    this.run({ sourceCode, sourceFileName })
    return this.patterns
  }

  exitFormatCall (node) {
    this.savePattern(node)
  }

  exitTranslateCall (node) {
    this.savePattern(node)
  }

  savePattern (node) {
    if (!this.isReplaceable(node)) return

    const pattern = this.getStringValue(node.arguments[0])
    const error = this.getPatternError(pattern)
    if (error) {
      this.reportError(node, 'SyntaxError: pattern is invalid', error.message)
    } else {
      const key = this.getKey(pattern)
      this.patterns[key] = getKeyNormalized(pattern)
    }
  }

  static extract (source, options) {
    return new Extractor(options).extract(source)
  }

  static extractFromFiles (files, options) {
    const extractor = new Extractor(options)
    const translations = {}
    extractor.forEachFile(files, source => {
      const patterns = extractor.extract(source)
      Object.assign(translations, patterns)
    })
    const json = JSON.stringify({
      [extractor.locale]: translations
    }, null, '  ')
    if (options.outFile) {
      extractor.emitFile(options.outFile, json)
    } else {
      extractor.emitResult(json)
    }
  }

}
