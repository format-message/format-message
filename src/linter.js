import Visitor from './visitor'
import Parser from 'message-format/parser'

export default class Linter extends Visitor {

  constructor (options) {
    super(options)
  }

  lint ({ sourceCode, sourceFileName }) {
    this.run({ sourceCode, sourceFileName })
  }

  visitFormatCall (path, traverser, opts) {
    traverser.traverse(path) // pre-travserse children

    const node = path.node
    const { isTranslateOnly } = opts
    let numErrors = 0

    const patternNode = node.arguments[0]
    const patternIsString = this.isString(patternNode)
    const pattern = patternIsString && this.getStringValue(patternNode)
    const patternError = pattern && this.getPatternError(pattern)
    const patternAst = pattern && !patternError && Parser.parse(pattern)
    const patternParams = patternAst && this.getPatternParams(patternAst)

    const argsNode = isTranslateOnly ? null : node.arguments[1]
    const argsIsLiteral = this.isObjectLiteral(argsNode)
    const argsPassed = argsIsLiteral && this.getObjectKeys(argsNode)

    const localeNode = isTranslateOnly ? node.arguments[1] : node.arguments[2]
    const localeIsString = this.isString(localeNode)
    const locale = localeIsString && this.getStringValue(localeNode)

    if (!patternIsString) {
      this.reportWarning(path, 'Warning: called without a literal pattern')
      ++numErrors
    }

    if (patternError) {
      this.reportError(path, 'SyntaxError: pattern is invalid', patternError.message)
      ++numErrors
    }

    if (!isTranslateOnly && patternParams && patternParams.length > 0 && !argsNode) {
      this.reportError(
        path,
        'TypeError: pattern requires parameters, but called with no arguments'
      )
      ++numErrors
    }

    if (!isTranslateOnly && patternParams && patternParams.length > 0 && argsIsLiteral) {
      const missingArgs = patternParams.filter(
        param => argsPassed.indexOf(param) === -1
      )
      missingArgs.forEach(arg => {
        this.reportError(
          path,
          'TypeError: pattern requires parameter "' + arg +
            '", but it is missing from the arguments object'
        )
        ++numErrors
      })
    }

    if (this.isReplaceable(path) && this.translations) {
      const translation = this.translate(pattern, locale || this.locale)
      const translationError = translation && this.getPatternError(translation)
      const translationAst = translation && !translationError && Parser.parse(translation)
      const translationParams = translationAst && this.getPatternParams(translationAst)

      if (translation == null) {
        this.reportWarning(
          path,
          'Warning: no ' + (locale || this.locale) + ' translation found for key ' +
            JSON.stringify(this.getKey(pattern))
        )
        ++numErrors
      }

      if (translationError) {
        this.reportError(
          path,
          'SyntaxError: ' + (locale || this.locale) +
            ' translated pattern is invalid for key ' +
            JSON.stringify(this.getKey(pattern)),
          translationError.message
        )
        ++numErrors
      }

      if (!isTranslateOnly && translationParams && translationParams.length > 0 && !argsNode) {
        this.reportError(
          path,
          'TypeError: ' + (locale || this.locale) +
            ' translated pattern requires parameters, but called with no arguments'
        )
        ++numErrors
      }

      if (!isTranslateOnly && translationParams && translationParams.length > 0 && argsIsLiteral) {
        const missingArgs = translationParams.filter(
          param => argsPassed.indexOf(param) === -1
        )
        missingArgs.forEach(arg => {
          this.reportError(
            path,
            'TypeError: ' + (locale || this.locale) +
              ' translated pattern requires parameter "' + arg +
              '", but it is missing from the arguments object'
          )
          ++numErrors
        })
      }
    }

    if (localeNode && !localeIsString) {
      this.reportWarning(path, 'Warning: called with a non-literal locale')
      ++numErrors
    }

    return numErrors
  }

  isObjectLiteral (node) {
    return node && node.type === 'ObjectExpression'
  }

  getObjectKeys (object) {
    return object.properties
      .filter(prop => prop.key.type === 'Identifier')
      .map(prop => prop.key.name)
  }

  getPatternParams (patternAst) {
    return patternAst.reduce((list, element) => {
      if (typeof element === 'string') return list
      const type = element[1]
      if (type === 'select' || type === 'plural' || type === 'selectordinal') {
        let newList = list.concat(element[0])
        const children = type === 'select' ? element[2] : element[3]
        Object.keys(children).forEach(key => {
          newList = newList.concat(this.getPatternParams(children[key]))
        })
      } else {
        return list.concat(element[0])
      }
    }, [])
  }

  static lint (source, options) {
    return new Linter(options).lint(source)
  }

  static lintFiles (files, options) {
    const linter = new Linter(options)
    linter.forEachFile(files, source => linter.lint(source))
  }

}
