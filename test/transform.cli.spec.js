/* eslint-env mocha */
var expect = require('chai').expect
var exec = require('child_process').exec
var fsUtil = require('fs')
var readFileSync = fsUtil.readFileSync
var unlinkSync = fsUtil.unlinkSync
var readdirSync = fsUtil.readdirSync
var rmdirSync = fsUtil.rmdirSync

describe('format-message transform -i', function () {
  describe('stdin', function () {
    it('finds and replaces simple strings', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and replaces template strings', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage(`hello`)'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a -o file', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message transform -i -o ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^import formatMessage from "format-message";?\n"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a --out-file file', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message transform -i --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^import formatMessage from "format-message";?\n"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translations', function () {
    it('uses -t translations', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"hey everyone"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --translations translations', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' --translations test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"hey everyone"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    describe('locale', function () {
      it('uses -l locale', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' -l pt' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"oi mundo"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('uses --locale locale', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' --locale pt' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"oi mundo"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })

    describe('generate-id', function () {
      it('uses -g type', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' -g underscored' +
          ' -t test/translations/inline.underscored.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"hey everyone"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('uses --generate-id type', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' --generate-id normalized' +
          ' -t test/translations/inline.normalized.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"hey everyone"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })

    describe('missing-translation', function () {
      it('causes a fatal error by default', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(err).to.exist
          expect(stdout.toString('utf8')).to.equal('')
          expect(stderr.toString('utf8')).to.match(/No en translation found/)
          done()
        }).stdin.end(input, 'utf8')
      })

      it('can trigger a non-fatal warning instead with -e warning ', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' -e warning' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.match(/No en translation found/)
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"not translated"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('can be ignored with --missing-translation ignore', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' --missing-translation ignore' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"not translated"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('can be replaced with -m replacement', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' -e ignore' +
          ' -m "!!MISSING!!"' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"!!MISSING!!"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('can be replaced with --missing-replacement', function (done) {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'packages/format-message-cli/format-message transform -i' +
          ' -e ignore' +
          ' --missing-replacement "!!MISSING!!"' +
          ' -t test/translations/inline.underscored_crc32.json'
        exec(cmd, function (err, stdout, stderr) {
          expect(stderr.toString('utf8')).to.equal('')
          expect(stdout.toString('utf8').trim()).to.match(/^import formatMessage from "format-message";?\n"!!MISSING!!"/)
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })
  })

  describe('source-maps-inline', function () {
    it('uses --source-maps-inline', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' --source-maps-inline' +
        ' -t test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.match(
          /^import formatMessage from "format-message";?\s*"hey everyone";?\s+\/\/# sourceMappingURL=data:application\/json;base64,/
        )
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('source-maps', function () {
    it('uses -s', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' -s' +
        ' -t test/translations/inline.underscored_crc32.json' +
        ' --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^import formatMessage from "format-message";?\n"hey everyone"/)
        var sourceMap = readFileSync(filename + '.map', 'utf8')
        unlinkSync(filename + '.map')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --source-maps', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var filename = 'test/translations/inline.js'
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' --source-maps' +
        ' -t test/translations/inline.underscored_crc32.json' +
        ' --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var fileContent = readFileSync(filename, 'utf8')
        unlinkSync(filename)
        expect(fileContent.trim()).to.match(/^import formatMessage from "format-message";?\n"hey everyone"/)
        var sourceMap = readFileSync(filename + '.map', 'utf8')
        unlinkSync(filename + '.map')
        expect(JSON.parse(sourceMap)).to.not.be.empty
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('out-dir', function () {
    var dirname = 'test/inline'
    var ofiles = readdirSync('test', 'utf8')
      .filter(function (file) {
        return file.slice(-3) === '.js'
      })

    afterEach(function () {
      var files = readdirSync(dirname, 'utf8')
      files.forEach(function (file) {
        unlinkSync(dirname + '/' + file)
      })
      rmdirSync(dirname)
    })

    it('outputs files to the directory relative to root', function (done) {
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' -d ' + dirname +
        ' -r test' +
        ' test/*.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var files = readdirSync(dirname, 'utf8').sort()
        expect(files).to.be.eql(ofiles.sort())
        var fileContent = readFileSync(dirname + '/format.spec.js', 'utf8')
        expect(fileContent.trim()).to.contain('\'x\' + arg + \'z\'')
        done(err)
      })
    })

    it('uses -s source-maps', function (done) {
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' -s' +
        ' -d ' + dirname +
        ' --root test' +
        ' test/*.js'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.equal('')
        var files = readdirSync(dirname, 'utf8').sort()
        expect(files).to.be.eql(
          ofiles.concat(ofiles.map(function (file) {
            return file + '.map'
          })).sort()
        )
        var fileContent =
          readFileSync(dirname + '/format.spec.js', 'utf8')
          .split('//# sourceMappingURL=')
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
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('f(')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles multiple function names in function context', function (done) {
      var input = 'import formatMessage from "format-message"\n' +
        'function foo(){var f=require("format-message");f("hello")}\n' +
        'function bar(){formatMessage("bye")}'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('f(')
        expect(stdout.toString('utf8')).to.not.contain('formatMessage(')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds function name from import', function (done) {
      var input = 'import __ from "format-message";__("hello")'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('__(')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })
})
