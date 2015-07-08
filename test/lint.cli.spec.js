/* eslint-env mocha */
var expect = require('chai').expect
var exec = require('child_process').exec

describe('format-message lint', function () {
  describe('input from stdin', function () {
    it('outputs nothing when no errors found', function (done) {
      var input = 'formatMessage("hello")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports errors from stdin input to stderr', function (done) {
      var input = 'formatMessage("{")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^SyntaxError\:/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports errors in translate calls', function (done) {
      var input = 'formatMessage.translate("{")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^SyntaxError\:/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports filename as "stdin" by default', function (done) {
      var input = 'formatMessage("{")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('at formatMessage (stdin:1:0)')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports passed -f filename in errors', function (done) {
      var input = 'formatMessage("{")'
      exec('bin/format-message lint -f a-file-name.js', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8'))
          .to.contain('at formatMessage (a-file-name.js:1:0)')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports passed --filename filename in errors', function (done) {
      var input = 'formatMessage("{")'
      exec('bin/format-message lint --filename b-file-name.js', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8'))
          .to.contain('at formatMessage (b-file-name.js:1:0)')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('colors', function () {
    it('outputs in color when specified', function (done) {
      var input = 'formatMessage(top);formatMessage("{")'
      exec('bin/format-message lint --color', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('\x1b[')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('outputs without color when specified', function (done) {
      var input = 'formatMessage(top);formatMessage("{")'
      exec('bin/format-message lint --no-color', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.not.contain('\x1b[')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('function name', function () {
    it('finds functions with specified -n name', function (done) {
      var input = '__(top)'
      exec('bin/format-message lint -n __', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal(
          'Warning: called without a literal pattern\n    at __ (stdin:1:0)\n'
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds functions with specified --function-name name', function (done) {
      var input = '__(top)'
      exec('bin/format-message lint --function-name __', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal(
          'Warning: called without a literal pattern\n    at __ (stdin:1:0)\n'
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('doesn\'t find method calls with the specified name (__)', function (done) {
      var input = 'top.__(top)'
      exec('bin/format-message lint -n __', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('doesn\'t find method calls with the specified name (format)', function (done) {
      var input = 'top.formatMessage("{")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translations and file input', function (done) {
    it('-k literal', function (done) {
      var cmd = 'bin/format-message lint' +
        ' -k literal' +
        ' -t test/translations/lint.literal.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain(
          'Warning: no en translation found for key "Simple string with nothing special"'
        )
        expect(stderr).to.contain('Warning: called without a literal pattern')
        expect(stderr).to.contain('Warning: called with a non-literal locale')
        done(err)
      })
    })

    it('--key-type normalized', function (done) {
      var cmd = 'bin/format-message lint' +
        ' --key-type normalized' +
        ' -t test/translations/lint.normalized.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain(
          'Warning: no en translation found for key "Simple string with nothing special"'
        )
        expect(stderr).to.contain('Warning: called without a literal pattern')
        expect(stderr).to.contain('Warning: called with a non-literal locale')
        done(err)
      })
    })

    it('--key-type underscored', function (done) {
      var cmd = 'bin/format-message lint' +
        ' --key-type underscored' +
        ' -t test/translations/lint.underscored.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain(
          'Warning: no en translation found for key "simple_string_with_nothing_special"'
        )
        expect(stderr).to.contain('Warning: called without a literal pattern')
        expect(stderr).to.contain('Warning: called with a non-literal locale')
        done(err)
      })
    })

    it('default underscored_crc32', function (done) {
      var cmd = 'bin/format-message lint' +
        ' -t test/translations/lint.underscored_crc32.json' +
        ' test/format.spec.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        stderr = stderr.toString('utf8')
        expect(stderr).to.contain(
          'Warning: no en translation found for key "simple_string_with_nothing_special_7eb61d5"'
        )
        expect(stderr).to.contain('Warning: called without a literal pattern')
        expect(stderr).to.contain('Warning: called with a non-literal locale')
        done(err)
      })
    })
  })

  describe('missing arguments', function () {
    it('warns when required arguments object is missing', function (done) {
      var input = 'formatMessage("{a}")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^TypeError\: pattern requires parameters/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('warns when required argument is missing from literal object', function (done) {
      var input = 'formatMessage("{a}", { b:1 })'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^TypeError\: pattern requires parameter/)
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function (done) {
      var input = 'var f=require("format-message");f("{")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^SyntaxError\:/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles multiple function names in function context', function (done) {
      var input = 'function foo(){var f=require("format-message");f("{")}' +
        'function bar(){formatMessage(foo)}'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('SyntaxError')
        expect(stderr.toString('utf8')).to.contain('Warning')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds function name from import', function (done) {
      var input = 'import __ from "format-message";__("{")'
      exec('bin/format-message lint', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^SyntaxError\:/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('is disabled by --no-auto', function (done) {
      var input = 'import __ from "format-message";__("{")'
      exec('bin/format-message lint --no-auto', function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })
})
