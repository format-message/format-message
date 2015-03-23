/*eslint-env mocha */
import { expect } from 'chai'
import { exec } from 'child_process'

describe('format-message lint', () => {
  describe('input from stdin', () => {
    it('outputs nothing when no errors found', done => {
      const input = 'formatMessage("hello")'
      exec('bin/format-message lint', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports errors from stdin input to stderr', done => {
      const input = 'formatMessage("{")'
      exec('bin/format-message lint', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.match(/^SyntaxError\:/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports filename as "stdin" by default', done => {
      const input = 'formatMessage("{")'
      exec('bin/format-message lint', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('at formatMessage (stdin:1:0)')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports passed -f filename in errors', done => {
      const input = 'formatMessage("{")'
      exec('bin/format-message lint -f a-file-name.js', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8'))
          .to.contain('at formatMessage (a-file-name.js:1:0)')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('reports passed --filename filename in errors', done => {
      const input = 'formatMessage("{")'
      exec('bin/format-message lint --filename b-file-name.js', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8'))
          .to.contain('at formatMessage (b-file-name.js:1:0)')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('colors', () => {
    it('outputs in color when specified', done => {
      const input = 'formatMessage(top);formatMessage("{")'
      exec('bin/format-message lint --color', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.contain('\x1b[')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('outputs without color when specified', done => {
      const input = 'formatMessage(top);formatMessage("{")'
      exec('bin/format-message lint --no-color', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.not.contain('\x1b[')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('function name', () => {
    it('finds functions with specified -n name', done => {
      const input = '__(top)'
      exec('bin/format-message lint -n __', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal(
          'Warning: called without a literal pattern\n    at __ (stdin:1:0)\n'
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds functions with specified --function-name name', done => {
      const input = '__(top)'
      exec('bin/format-message lint --function-name __', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal(
          'Warning: called without a literal pattern\n    at __ (stdin:1:0)\n'
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('doesn\'t find method calls with the specified name (__)', done => {
      const input = 'top.__(top)'
      exec('bin/format-message lint -n __', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('doesn\'t find method calls with the specified name (format)', done => {
      const input = 'top.formatMessage("{")'
      exec('bin/format-message lint', (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translations and file input', done => {
    it('-k literal', done => {
      const cmd = 'bin/format-message lint' +
        ' -k literal' +
        ' -t test/translations/lint.literal.json' +
        ' test/format.spec.js'
      exec(cmd, (err, stdout, stderr) => {
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

    it('--key-type normalized', done => {
      const cmd = 'bin/format-message lint' +
        ' --key-type normalized' +
        ' -t test/translations/lint.normalized.json' +
        ' test/format.spec.js'
      exec(cmd, (err, stdout, stderr) => {
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

    it('--key-type underscored', done => {
      const cmd = 'bin/format-message lint' +
        ' --key-type underscored' +
        ' -t test/translations/lint.underscored.json' +
        ' test/format.spec.js'
      exec(cmd, (err, stdout, stderr) => {
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

    it('default underscored_crc32', done => {
      const cmd = 'bin/format-message lint' +
        ' -t test/translations/lint.underscored_crc32.json' +
        ' test/format.spec.js'
      exec(cmd, (err, stdout, stderr) => {
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
})
