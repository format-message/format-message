import Visitor from './visitor'

export default class Linter extends Visitor {

  constructor (options) {
    super(options)
  }

  lint ({ sourceCode, sourceFileName }) {
    this.run({ sourceCode, sourceFileName })
  }

  visitFormatCall (path, traverser) {
    traverser.traverse(path) // pre-travserse children

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

  static lint (source, options) {
    return new Linter(options).lint(source)
  }

  static lintFiles (files, options) {
    const linter = new Linter(options)
    linter.forEachFile(files, source => linter.lint(source))
  }

}
