/* eslint-env mocha */
var expect = require('chai').expect
var exec = require('child_process').exec

describe('format-message lint', function () {
  describe('input from stdin', function () {
    it('outputs nothing when no errors found', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("hello")'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports errors from stdin input to stderr', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('Pattern is invalid')
        done()
      }).stdin.end(input, 'utf8')
    })

    it('reports filename as "stdin" by default', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('stdin')
        done()
      }).stdin.end(input, 'utf8')
    })

    it('reports passed -f filename in errors', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      exec('packages/format-message-cli/format-message lint -f a-file-name.js', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('a-file-name.js')
        done()
      }).stdin.end(input, 'utf8')
    })

    it('reports passed --filename filename in errors', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("{")'
      exec('packages/format-message-cli/format-message lint --filename b-file-name.js', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('b-file-name.js')
        done()
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translations and file input', function (done) {
    it('-g literal', function (done) {
      var cmd = 'packages/format-message-cli/format-message lint' +
        ' -g literal' +
        ' -t test/translations/lint.literal.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(err).to.not.exist
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain('Translation for "Simple string with nothing special" in "en" is missing')
        expect(stderr).to.contain('Pattern is not a string literal')
        expect(stderr).to.contain('Locale is not a string literal')
        done()
      })
    })

    it('--generate-id normalized', function (done) {
      var cmd = 'packages/format-message-cli/format-message lint' +
        ' --generate-id normalized' +
        ' -t test/translations/lint.normalized.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(err).to.not.exist
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain('Translation for "Simple string with nothing special" in "en" is missing')
        expect(stderr).to.contain('Pattern is not a string literal')
        expect(stderr).to.contain('Locale is not a string literal')
        done()
      })
    })

    it('--generate-id underscored', function (done) {
      var cmd = 'packages/format-message-cli/format-message lint' +
        ' --generate-id underscored' +
        ' -t test/translations/lint.underscored.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(err).to.not.exist
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain('Translation for "simple_string_with_nothing_special" in "en" is missing')
        expect(stderr).to.contain('Pattern is not a string literal')
        expect(stderr).to.contain('Locale is not a string literal')
        done()
      })
    })

    it('default underscored_crc32', function (done) {
      var cmd = 'packages/format-message-cli/format-message lint' +
        ' -t test/translations/lint.underscored_crc32.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(err).to.not.exist
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain('Translation for "simple_string_with_nothing_special_7eb61d5" in "en" is missing')
        expect(stderr).to.contain('Pattern is not a string literal')
        expect(stderr).to.contain('Locale is not a string literal')
        done()
      })
    })
  })

  describe('missing arguments', function () {
    it('warns when required arguments object is missing', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("{a}")'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('Pattern requires missing parameters')
        done()
      }).stdin.end(input, 'utf8')
    })

    it('warns when required argument is missing from literal object', function (done) {
      var input = 'import formatMessage from "format-message";formatMessage("{a}", { b:1 })'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('Pattern requires missing "a" parameter')
        done()
      }).stdin.end(input, 'utf8')
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function (done) {
      var input = 'var f=require("format-message");f("{")'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('Pattern is invalid')
        done()
      }).stdin.end(input, 'utf8')
    })

    it('handles multiple function names in function context', function (done) {
      var input = 'import formatMessage from "format-message";function foo(){var f=require("format-message");f("{")}' +
        'function bar(){formatMessage(foo)}'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('Pattern is invalid')
        expect(stderr.toString('utf8')).to.contain('warning')
        done()
      }).stdin.end(input, 'utf8')
    })

    it('finds function name from import', function (done) {
      var input = 'import __ from "format-message";__("{")'
      exec('packages/format-message-cli/format-message lint', function (err, stdout, stderr) {
        expect(err).to.exist
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('Pattern is invalid')
        done()
      }).stdin.end(input, 'utf8')
    })
  })
})
