/* eslint-env mocha */
var expect = require('chai').expect
var exec = require('child_process').exec
var fsUtil = require('fs')
var readFileSync = fsUtil.readFileSync
var unlinkSync = fsUtil.unlinkSync
var readdirSync = fsUtil.readdirSync
var rmdirSync = fsUtil.rmdirSync

describe('format-message inline', function () {
  describe('stdin', function () {
    it('finds and replaces simple strings', function (done) {
      var input = 'formatMessage("hello")'
      exec('packages/format-message-cli/format-message inline', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and replaces template strings', function (done) {
      var input = 'formatMessage(`hello`)'
      exec('packages/format-message-cli/format-message inline', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and replaces translate calls', function (done) {
      var input = 'formatMessage.translate("hello { name }")'
      exec('packages/format-message-cli/format-message inline', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hello { name }"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a -o file', function (done) {
      var input = 'formatMessage("hello")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message inline -o ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a --out-file file', function (done) {
      var input = 'formatMessage("hello")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message inline --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds -n named functions', function (done) {
      var input = '__("hello world")'
      var cmd = 'packages/format-message-cli/format-message inline -n __'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hello world"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds --function-name named functions', function (done) {
      var input = '$("hello world")'
      var cmd = 'packages/format-message-cli/format-message inline --function-name $'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hello world"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translations', function () {
    it('uses -t translations', function (done) {
      var input = 'formatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --translations translations', function (done) {
      var input = 'formatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' --translations test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    describe('locale', function () {
      it('uses -l locale', function (done) {
        var input = 'formatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' -l pt' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"oi mundo"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('uses --locale locale', function (done) {
        var input = 'formatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' --locale pt' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"oi mundo"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })

    describe('key-type', function () {
      it('uses -k key', function (done) {
        var input = 'formatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' -k underscored' +
          ' -t test/translations/inline.underscored.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('uses --key-type key', function (done) {
        var input = 'formatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' --key-type normalized' +
          ' -t test/translations/inline.normalized.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })

    describe('missing-translation', function () {
      it('causes a fatal error by default', function (done) {
        var input = 'formatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(err).to.exist
          expect(stdout.toString('utf8')).to.equal('')
          expect(stderr.toString('utf8')).to.match(/^Error: no en translation found/)
          done()
        }).stdin.end(input, 'utf8')
      })

      it('can trigger a non-fatal warning instead with -e warning ', function (done) {
        var input = 'formatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' -e warning' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.match(/^Warning: no en translation found/)
          expect(stdout.toString('utf8').trim()).to.match(/^"not translated"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('can be ignored with --missing-translation ignore', function (done) {
        var input = 'formatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' --missing-translation ignore' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"not translated"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('can be replaced with -m replacement', function (done) {
        var input = 'formatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' -e ignore' +
          ' -m "!!MISSING!!"' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"!!MISSING!!"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('can be replaced with --missing-replacement', function (done) {
        var input = 'formatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message inline' +
          ' -e ignore' +
          ' --missing-replacement "!!MISSING!!"' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^"!!MISSING!!"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })
  })

  describe('source-maps-inline', function () {
    it('uses -i', function (done) {
      var input = 'formatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' -i' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.match(
          /^\s*"hey everyone";?\s+\/\/# sourceMappingURL=data\:application\/json;base64,/
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --source-maps-inline', function (done) {
      var input = 'formatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' --source-maps-inline' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.match(
          /^\s*"hey everyone";?\s+\/\/# sourceMappingURL=data\:application\/json;base64,/
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('source-maps', function () {
    it('uses -s', function (done) {
      var input = 'formatMessage("hello world")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' -s' +
        ' -t test/translations/inline.underscored_crc32.json' +
        ' --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^\"hey everyone"/)
        var sourceMap = readFileSync(filename + '.map', 'utf8')
        unlinkSync(filename + '.map')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --source-maps', function (done) {
      var input = 'formatMessage("hello world")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' --source-maps' +
        ' -t test/translations/inline.underscored_crc32.json' +
        ' --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^"hey everyone"/)
        var sourceMap = readFileSync(filename + '.map', 'utf8')
        unlinkSync(filename + '.map')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('out-dir', function () {
    var dirname = 'test/inline'

    afterEach(function () {
      var files = readdirSync(dirname, 'utf8')
      files.forEach(function (file) {
        unlinkSync(dirname + '/' + file)
      })
      rmdirSync(dirname)
    })

    it('outputs files to the directory relative to root', function (done) {
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' -d ' + dirname +
        ' -r test' +
        ' test/*.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var files = readdirSync(dirname, 'utf8').sort()
        expect(files).to.be.eql([
          'extract.cli.spec.js',
          'format-inline.spec.js',
          'format.spec.js',
          'inline.cli.spec.js',
          'lint.cli.spec.js'
        ].sort())
        var fileContent = readFileSync(dirname + '/format.spec.js', 'utf8')
        expect(fileContent.trim()).to.contain('\'x\' + arg + \'z\'')
        done(err)
      })
    })

    it('uses -s source-maps', function (done) {
      var cmd = 'packages/format-message-cli/format-message inline' +
        ' -s' +
        ' -d ' + dirname +
        ' --root test' +
        ' test/*.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var files = readdirSync(dirname, 'utf8').sort()
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
          'lint.cli.spec.js.map'
        ].sort())
        var fileContent =
          readFileSync(dirname + '/format.spec.js', 'utf8')
          .split('\/\/# sourceMappingURL=')
        expect(fileContent[0].trim()).to.contain('\'x\' + arg + \'z\'')
        expect((fileContent[1] || '').trim()).to.equal('format.spec.js.map')
        var sourceMap = readFileSync(dirname + '/format.spec.js.map', 'utf8')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      })
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function (done) {
      var input = 'var f=require("format-message");f("hello")'
      exec('packages/format-message-cli/format-message inline', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('f(')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles multiple function names in function context', function (done) {
      var input = 'function foo(){var f=require("format-message");f("hello")}' +
        'function bar(){formatMessage("bye")}'
      exec('packages/format-message-cli/format-message inline', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('f(')
        expect(stdout.toString('utf8')).to.not.contain('formatMessage(')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds function name from import', function (done) {
      var input = 'import __ from "format-message";__("hello")'
      exec('packages/format-message-cli/format-message inline', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('__(')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('is disabled by --no-auto', function (done) {
      var input = 'import __ from "format-message";__("hello")'
      exec('packages/format-message-cli/format-message inline --no-auto', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.contain('__(')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })
})
