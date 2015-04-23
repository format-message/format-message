import { readFileSync, writeFileSync } from 'fs'
import { relative, resolve, dirname, basename, join as pathJoin } from 'path'
import mkdirp from 'mkdirp'
import recast from 'recast'
import sourceMap from 'source-map'
import chalk from 'chalk'
import Parser from 'message-format/parser'
import { getTranslate, getGetKey, getKeyNormalized, getKeyUnderscoredCrc32 } from './translate-util'
import Transpiler from './transpiler'
import packageJson from '../package.json'
const Literal = recast.types.namedTypes.Literal.toString()
const TemplateLiteral = recast.types.namedTypes.TemplateLiteral.toString()
const CallExpression = recast.types.namedTypes.CallExpression.toString()
const ImportDefaultSpecifier = recast.types.namedTypes.ImportDefaultSpecifier.toString()

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

  reportWarning (path, message) {
    this.emitWarning(
      chalk.bold.yellow(message) + '\n' +
      chalk.yellow(this.getLocation(path))
    )
  }

  reportError (path, message, submessage) {
    this.emitError(
      chalk.red(
        chalk.bold(message) + '\n' +
        this.getLocation(path) +
        (!submessage ? '' :
          '\n    ' + submessage.replace(/\n/g, '\n    ')
        )
      )
    )
  }

  getLocation (path) {
    const translate = this.isTranslateCall(path) ?
      '.translate' : ''

    return (
      '    at ' + this.functionName + translate + ' (' +
      this.currentFileName + ':' +
      path.node.loc.start.line + ':' +
      path.node.loc.start.column + ')'
    )
  }

  isFormatImport (node) {
    return node && (
      node.source
      && node.source.value === packageJson.name
      && node.specifiers
      && node.specifiers[0]
      && node.specifiers[0].type === ImportDefaultSpecifier
    )
  }

  isFormatRequire (node, depth=0) {
    return node && (
      node.type === CallExpression
      && node.callee.name === 'require'
      && this.isString(node.arguments[0])
      && this.getStringValue(node.arguments[0]) === packageJson.name
    ) || node && (
      // _interopRequire or other wrapper
      node.type === CallExpression
      && depth <= 1 // allow at most one wrapper around require
      && this.isFormatRequire(node.arguments[0], depth + 1)
    )
  }

  isFormatCall (path) {
    const node = path.node
    return node.callee && (
      node.callee.name === this.functionName
    )
  }

  isTranslateCall (path) {
    const node = path.node
    const callee = node.callee
    return callee && (
      // member expression
      callee.object && callee.object.name === this.functionName
      && callee.property && callee.property.name === 'translate'
    )
  }

  isReplaceable (path) {
    const node = path.node
    return node && (
      this.isFormatCall(path)
      // first argument is a literal string, or template literal with no expressions
      && this.isString(node.arguments[0])
      && (
        // no specified locale, or is a literal string
        !node.arguments[2]
        || this.isString(node.arguments[2])
      )
      ||
      this.isTranslateCall(path)
      && this.isString(node.arguments[0])
      && (
        !node.arguments[1]
        || this.isString(node.arguments[1])
      )

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

  getStringValue (literal) {
    if (literal.type === TemplateLiteral) {
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

  run ({ sourceCode, sourceFileName }) {
    const ast = this.parse({ sourceCode, sourceFileName })
    if (ast) {
      const self = this
      recast.visit(ast, this.visitors({
        visitCallExpression (path) {
          const isTranslateOnly = self.isTranslateCall(path)
          if (isTranslateOnly || self.isFormatCall(path)) {
            self.visitFormatCall(path, this, { isTranslateOnly })
          } else {
            this.traverse(path)
          }
        }
      }))
    }
    return ast
  }

  parse ({ sourceCode, sourceFileName }) {
    this.currentFileName = sourceFileName
    try {
      return recast.parse(sourceCode, { sourceFileName })
    } catch (error) {
      this.emitError(
        chalk.red(
          chalk.bold('SyntaxError: Could not parse source code') + '\n' +
          '    at ' + sourceFileName + '\n' +
          '    ' + error.message
        )
      )
    }
  }

  print ({ ast, sourceMapName, inputSourceMap }) {
    return recast.print(ast, { sourceMapName, inputSourceMap })
  }

  visitors (base) {
    if (this.autoDetectFunctionName) {
      const self = this
      Object.assign(base, {
        // simplistic function and file scope tracking
        visitFunction (path) {
          const functionName = self.functionName
          this.traverse(path) // traverse children
          self.functionName = functionName
        },

        visitProgram (path) {
          const functionName = self.functionName
          this.traverse(path) // traverse children
          self.functionName = functionName
        },

        visitVariableDeclarator (path) {
          this.traverse(path) // pre-travserse children
          if (self.isFormatRequire(path.node.init)) {
            self.functionName = path.node.id.name
          }
        },

        visitImportDeclaration (path) {
          this.traverse(path) // pre-travserse children
          if (self.isFormatImport(path.node)) {
            self.functionName = path.node.specifiers[0].id.name
          }
        }
      })
    }
    return base
  }

}
