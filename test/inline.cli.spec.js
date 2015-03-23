/*eslint-env mocha */
import { expect } from 'chai'
import { exec } from 'child_process'
import { readFileSync, unlinkSync, readdirSync, rmdirSync } from 'fs'

describe('format-message inline', () => {
  describe('stdin', () => {
    it('finds and replaces simple strings', done => {
      const input = 'formatMessage("hello")'
      exec('bin/format-message inline', (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and replaces template strings', done => {
      const input = 'formatMessage(`hello`)'
      exec('bin/format-message inline', (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a -o file', done => {
      const input = 'formatMessage("hello")'
      const filename = 'test/translations/inline.js'
      const cmd = 'bin/format-message inline -o ' + filename
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        const fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.equal('"hello"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a --out-file file', done => {
      const input = 'formatMessage("hello")'
      const filename = 'test/translations/inline.js'
      const cmd = 'bin/format-message inline --out-file ' + filename
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        const fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.equal('"hello"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds -n named functions', done => {
      const input = '__("hello world")'
      const cmd = 'bin/format-message inline -n __'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello world"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds --function-name named functions', done => {
      const input = '$("hello world")'
      const cmd = 'bin/format-message inline --function-name $'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello world"')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translations', () => {
    it('uses -t translations', done => {
      const input = 'formatMessage("hello world")'
      const cmd = 'bin/format-message inline' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --translations translations', done => {
      const input = 'formatMessage("hello world")'
      const cmd = 'bin/format-message inline' +
        ' --translations test/translations/inline.underscored_crc32.json'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    describe('locale', () => {
      it('uses -l locale', done => {
        const input = 'formatMessage("hello world")'
        const cmd = 'bin/format-message inline' +
          ' -l pt' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, (err, stdout, stderr) => {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.equal('"oi mundo"')
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('uses --locale locale', done => {
        const input = 'formatMessage("hello world")'
        const cmd = 'bin/format-message inline' +
          ' --locale pt' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, (err, stdout, stderr) => {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.equal('"oi mundo"')
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })

    describe('key-type', () => {
      it('uses -k key', done => {
        const input = 'formatMessage("hello world")'
        const cmd = 'bin/format-message inline' +
          ' -k underscored' +
          ' -t test/translations/inline.underscored.json'
        exec(cmd, (err, stdout, stderr) => {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('uses --key-type key', done => {
        const input = 'formatMessage("hello world")'
        const cmd = 'bin/format-message inline' +
          ' --key-type normalized' +
          ' -t test/translations/inline.normalized.json'
        exec(cmd, (err, stdout, stderr) => {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })
  })

  describe('source-maps-inline', () => {
    it('uses -i', done => {
      const input = 'formatMessage("hello world")'
      const cmd = 'bin/format-message inline' +
        ' -i' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.match(
          /^\s*"hey everyone"\s+\/\/# sourceMappingURL=data\:application\/json;base64,/
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --source-maps-inline', done => {
      const input = 'formatMessage("hello world")'
      const cmd = 'bin/format-message inline' +
        ' --source-maps-inline' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.match(
          /^\s*"hey everyone"\s+\/\/# sourceMappingURL=data\:application\/json;base64,/
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('source-maps', () => {
    it('uses -s', done => {
      const input = 'formatMessage("hello world")'
      const filename = 'test/translations/inline.js'
      const cmd = 'bin/format-message inline' +
        ' -s' +
        ' -t test/translations/inline.underscored_crc32.json' +
        ' --out-file ' + filename
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        const fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^\s*"hey everyone"/)
        const sourceMap = readFileSync(filename + '.map', 'utf8')
        unlinkSync(filename + '.map')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --source-maps', done => {
      const input = 'formatMessage("hello world")'
      const filename = 'test/translations/inline.js'
      const cmd = 'bin/format-message inline' +
        ' --source-maps' +
        ' -t test/translations/inline.underscored_crc32.json' +
        ' --out-file ' + filename
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        const fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^\s*"hey everyone"/)
        const sourceMap = readFileSync(filename + '.map', 'utf8')
        unlinkSync(filename + '.map')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('out-dir', () => {
    const dirname = 'test/inline'

    afterEach(() => {
      const files = readdirSync(dirname, 'utf8')
      for (let file of files) {
        unlinkSync(dirname + '/' + file)
      }
      rmdirSync(dirname)
    })

    it('outputs files to the directory relative to root', done => {
      const cmd = 'bin/format-message inline' +
        ' -d ' + dirname +
        ' -r test' +
        ' test/*.js'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        const files = readdirSync(dirname, 'utf8').sort()
        expect(files).to.be.eql([
          'extract.cli.spec.js',
          'format-inline.spec.js',
          'format.spec.js',
          'inline.cli.spec.js',
          'lint.cli.spec.js',
          'setup.js'
        ].sort())
        const fileContent = readFileSync(dirname + '/format.spec.js', 'utf8')
        expect(fileContent.trim()).to.contain('"x" + args["arg"] + "z"')
        done(err)
      })
    })

    it('uses -s source-maps', done => {
      const cmd = 'bin/format-message inline' +
        ' -s' +
        ' -d ' + dirname +
        ' --root test' +
        ' test/*.js'
      exec(cmd, (err, stdout, stderr) => {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        const files = readdirSync(dirname, 'utf8').sort()
        expect(files).to.be.eql([
          'extract.cli.spec.js',
          'extract.cli.spec.js.map',
          'format-inline.spec.js',
          'format-inline.spec.js.map',
          'format.spec.js',
          'format.spec.js.map',
          'inline.cli.spec.js',
          'inline.cli.spec.js.map',
          'lint.cli.spec.js',
          'lint.cli.spec.js.map',
          'setup.js',
          'setup.js.map'
        ].sort())
        const fileContent =
          readFileSync(dirname + '/format.spec.js', 'utf8')
          .split('\/\/# sourceMappingURL=')
        expect(fileContent[0].trim()).to.contain('"x" + args["arg"] + "z"')
        expect((fileContent[1] || '').trim()).to.equal('format.spec.js.map')
        const sourceMap = readFileSync(dirname + '/format.spec.js.map', 'utf8')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      })
    })
  })
})
