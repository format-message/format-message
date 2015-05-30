import { readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import mkdirp from 'mkdirp'
import * as babel from 'babel-core'
import chalk from 'chalk'
import Parser from 'message-format/parser'
import { getTranslate, getGetKey } from './translate-util'
import packageJson from '../package.json'

const types = babel.types

/**
 * Base class for traversing source code to lint, extract, and inline messages
 **/
export default class Visitor {

  constructor (options={}) {
    this.functionName = options.functionName || 'formatMessage'
    this.autoDetectFunctionName = 'autoDetectFunctionName' in options ?
      !!options.autoDetectFunctionName : true
    this.getKey = getGetKey(options)
    this.translate = getTranslate(options)
    this.translations = options.translations
    this.missingTranslation = options.missingTranslation
    this.missingReplacement = options.missingReplacement
    this.locale = options.locale || 'en'
    this.currentFileName = null
    this.scopes = []

    if (typeof options.emitWarning === 'function') {
      this.emitWarning = options.emitWarning
    }
    if (typeof options.emitError === 'function') {
      this.emitError = options.emitError
    }
    if (typeof options.emitResult === 'function') {
      this.emitResult = options.emitResult
    }
    if (typeof options.emitFile === 'function') {
      this.emitFile = options.emitFile
    }
  }

  emitWarning (message) {
    console.warn(message)
  }

  emitError (message) {
    console.error(message)
  }

  emitResult (code) {
    console.log(code)
  }

  emitFile (filename, content, sourcemap) {
    mkdirp.sync(dirname(filename))
    writeFileSync(filename, content, 'utf8')
  }

  reportWarning (node, message) {
    this.emitWarning(
      chalk.bold.yellow(message) + '\n' +
      chalk.yellow(this.getLocation(node))
    )
  }

  reportError (node, message, submessage) {
    this.emitError(
      chalk.red(
        chalk.bold(message) + '\n' +
        this.getLocation(node) +
        (!submessage ? '' :
          '\n    ' + submessage.replace(/\n/g, '\n    ')
        )
      )
    )
  }

  getLocation (node) {
    const translate = this.isTranslateCall(node) ? '.translate' : ''
    return (
      '    at ' + this.functionName + translate + ' (' +
      this.currentFileName + ':' +
      node.loc.start.line + ':' +
      node.loc.start.column + ')'
    )
  }

  isFormatImport (node) {
    return node && (
      types.isImportDeclaration(node) &&
      types.isLiteral(node.source, { value: packageJson.name }) &&
      node.specifiers.length === 1 &&
      types.isImportDefaultSpecifier(node.specifiers[0])
    )
  }

  isFormatRequire (node) {
    return node && (
      types.isCallExpression(node) &&
      types.isIdentifier(node.callee, { name: 'require' }) &&
      this.isString(node.arguments[0]) &&
      this.getStringValue(node.arguments[0]) === packageJson.name
    )
  }

  isFormatCall (node) {
    return node && (
      types.isCallExpression(node) &&
      types.isIdentifier(node.callee, { name: this.functionName })
    )
  }

  isTranslateCall (node) {
    const callee = node && node.callee
    return callee && (
      types.isMemberExpression(callee) &&
      types.isIdentifier(callee.object, { name: this.functionName }) &&
      types.isIdentifier(callee.property, { name: 'translate' })
    )
  }

  isReplaceable (node) {
    return node && (
      this.isFormatCall(node) &&
      // first argument is a literal string, or template literal with no expressions
      this.isString(node.arguments[0]) && (
        // no specified locale, or is a literal string
        !node.arguments[2] ||
        this.isString(node.arguments[2])
      ) ||
      this.isTranslateCall(node) &&
      this.isString(node.arguments[0]) && (
        !node.arguments[1] ||
        this.isString(node.arguments[1])
      )
    )
  }

  isString (node) {
    return node && (
      types.isLiteral(node) &&
      typeof node.value === 'string' || (
        types.isTemplateLiteral(node) &&
        node.expressions.length === 0 &&
        node.quasis.length === 1
      )
    )
  }

  getStringValue (literal) {
    if (types.isTemplateLiteral(literal)) {
      return literal.quasis[0].value.cooked
    }
    return literal.value
  }

  getPatternError (pattern) {
    try {
      Parser.parse(pattern)
    } catch (error) {
      return error
    }
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

  run ({ sourceCode, sourceFileName, sourceMapName, inputSourceMap }) {
    const filename = this.currentFileName = sourceFileName
    const shouldOutputCode = this.shouldOutputCode()
    try {
      return babel.transform(sourceCode, {
        // result properties to populate
        code: shouldOutputCode, // .code
        sourceMaps: shouldOutputCode, // .map
        ast: false, // .ast

        filename,
        sourceMapName,
        inputSourceMap,
        plugins: [
          new babel.Transformer('format-message', this.visitors())
        ],
        whitelist: []
      })
    } catch (error) {
      if (!/^SyntaxError/.test(error.message) || !error.loc) {
        throw error
      }
      const { line, column } = error.loc
      this.emitError(
        chalk.red(
          chalk.bold('SyntaxError: Could not parse source code') + '\n' +
          '    at ' + sourceFileName + ':' + line + ':' + column + '\n' +
          '    ' + error.message
        )
      )
      return shouldOutputCode ? { code: sourceCode, map: inputSourceMap } : {}
    }
  }

  visitors () {
    const self = this
    // simplistic function and file scope tracking
    const enter = () => { this.scopes.push(this.functionName) }
    const exit = () => { this.functionName = this.scopes.pop() }
    return {
      Function: { enter, exit },

      // `this` is bound to the traverser, `self` is the visitor
      Program: {
        enter (node, parent, scope) {
          enter()
          self.enterProgram(node, parent, scope, this)
        },
        exit (node, parent, scope) {
          exit()
          self.exitProgram(node, parent, scope, this)
        }
      },

      VariableDeclarator: {
        exit (node) {
          if (self.autoDetectFunctionName && self.isFormatRequire(node.init)) {
            self.functionName = node.id.name
          }
        }
      },

      ImportDeclaration: {
        exit (node) {
          if (self.autoDetectFunctionName && self.isFormatImport(node)) {
            self.functionName = (
              node.specifiers[0].local ||
              node.specifiers[0].id
            ).name
          }
        }
      },

      CallExpression: {
        enter (node, parent, scope) {
          if (self.isFormatCall(node)) {
            self.enterFormatCall(node, parent, scope, this)
          } else if (self.isTranslateCall(node)) {
            self.enterTranslateCall(node, parent, scope, this)
          }
        },
        exit (node, parent, scope) {
          if (self.isFormatCall(node)) {
            self.exitFormatCall(node, parent, scope, this)
          } else if (self.isTranslateCall(node)) {
            self.exitTranslateCall(node, parent, scope, this)
          }
        }
      }
    }
  }

  // to be overridden
  shouldOutputCode () {
    return false
  }

  // to be overridden
  enterFormatCall () {}
  exitFormatCall () {}
  enterTranslateCall () {}
  exitTranslateCall () {}
  enterProgram () {}
  exitProgram () {}

}
