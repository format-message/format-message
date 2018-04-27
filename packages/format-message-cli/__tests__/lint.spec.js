/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
var expect = require('chai').expect
var exec = require('./exec')

describe('format-message lint', function () {
  describe('input from stdin', function () {
    it('outputs nothing when no errors found', function () {
      var input = 'import formatMessage from "format-message";formatMessage("hello")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.equal('')
    })

    it('reports errors from stdin input to stderr', function () {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern is invalid')
    })

    it('reports filename as "stdin" by default', function () {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('stdin')
    })

    it('reports passed -f filename in errors', function () {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      var { code, stdout, stderr } = exec('format-message lint -f a-file-name.js', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('a-file-name.js')
    })

    it('reports passed --filename filename in errors', function () {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      var { code, stdout, stderr } = exec('format-message lint --filename b-file-name.js', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('b-file-name.js')
    })
  })

  describe('translations and file input', function () {
    it('default literal', function () {
      var cmd = 'format-message lint' +
      ' -t packages/format-message-cli/__tests__/translations/lint.literal.json' +
      ' packages/format-message/__tests__/index.spec.js'
      var { code, stdout, stderr } = exec(cmd)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Translation for "Simple string with nothing special" in "en" is missing')
      expect(stderr).to.contain('Pattern is not a string literal')
    })

    it('--generate-id normalized', function () {
      var cmd = 'format-message lint' +
      ' --generate-id normalized' +
      ' -t packages/format-message-cli/__tests__/translations/lint.normalized.json' +
      ' packages/format-message/__tests__/index.spec.js'
      var { code, stdout, stderr } = exec(cmd)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Translation for "Simple string with nothing special" in "en" is missing')
      expect(stderr).to.contain('Pattern is not a string literal')
    })

    it('--generate-id underscored', function () {
      var cmd = 'format-message lint' +
      ' --generate-id underscored' +
      ' -t packages/format-message-cli/__tests__/translations/lint.underscored.json' +
      ' packages/format-message/__tests__/index.spec.js'
      var { code, stdout, stderr } = exec(cmd)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Translation for "simple_string_with_nothing_special" in "en" is missing')
      expect(stderr).to.contain('Pattern is not a string literal')
    })

    it('-g underscored_crc32', function () {
      var cmd = 'format-message lint' +
      ' -g underscored_crc32' +
      ' -t packages/format-message-cli/__tests__/translations/lint.underscored_crc32.json' +
      ' packages/format-message/__tests__/index.spec.js'
      var { code, stdout, stderr } = exec(cmd)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Translation for "simple_string_with_nothing_special_7eb61d5" in "en" is missing')
      expect(stderr).to.contain('Pattern is not a string literal')
    })
  })

  describe('missing arguments', function () {
    it('warns when required arguments object is missing', function () {
      var input = 'import formatMessage from "format-message";formatMessage("{a}")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern requires missing parameters')
    })

    it('warns when required argument is missing from literal object', function () {
      var input = 'import formatMessage from "format-message";formatMessage("{a}", { b:1 })'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern requires missing "a" parameter')
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function () {
      var input = 'var f=require("format-message");f("{")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern is invalid')
    })

    it('handles multiple function names in function context', function () {
      var input = 'import formatMessage from "format-message";function foo(){var f=require("format-message");f("{")}' +
      'function bar(){formatMessage(foo)}'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern is invalid')
      expect(stderr).to.contain('warning')
    })

    it('finds function name from import', function () {
      var input = 'import __ from "format-message";__("{")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern is invalid')
    })

    it('finds function name from default import', function () {
      var input = 'import {default as __} from "format-message";__("{")'
      var { code, stdout, stderr } = exec('format-message lint', input)
      expect(code).to.not.equal(0)
      expect(stdout).to.equal('')
      expect(stderr).to.contain('Pattern is invalid')
    })
  })
})
