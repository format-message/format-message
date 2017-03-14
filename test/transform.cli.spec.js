/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
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
        expect(stdout.toString('utf8').trim()).to.match(/^"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and replaces template strings', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage(`hello`)'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hello"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles placeholders', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {world}", {world:"world"})'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello " + "world";')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles dotted placeholders', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {a.b}", {a:{b:"world"}})'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello " + "world";')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles dotted placeholders for non-literal params', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {a.b.c}", params)'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.equal('"hello " + ("a.b.c" in params ? params["a.b.c"] : params.a.b.c);')
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
        expect(fileContent.trim()).to.match(/^"hello"/)
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
        expect(fileContent.trim()).to.match(/^"hello"/)
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
        expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses --translations translations', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message transform -i' +
        ' --translations test/translations/inline.underscored_crc32.json'
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"oi mundo"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"oi mundo"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"hey everyone"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"not translated"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"not translated"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"!!MISSING!!"/)
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
          expect(stdout.toString('utf8').trim()).to.match(/^"!!MISSING!!"/)
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
        expect(stdout.toString('utf8').trim()).to.match(
          /^"hey everyone";?\s+\/\/# sourceMappingURL=data:application\/json/
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
        expect(fileContent.trim()).to.match(/^"hey everyone"/)
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

    it('finds function name from default import', function (done) {
      var input = 'import {default as __} from "format-message";__("hello")'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        expect(stdout.toString('utf8')).to.not.contain('__(')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('translate="yes"', function () {
    it('transforms messages from JSX', function (done) {
      var input = 'export default <div translate="yes">hello</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('export default <div>hello</div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores empty element except removing translate attribute', function (done) {
      var input = '<div translate="yes"></div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('<div></div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores element with no children except removing translate attribute', function (done) {
      var input = '<div translate="yes" />'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('<div />')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores elements without translate="yes"', function (done) {
      var input = '<div>Untranslated</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('<div>Untranslated</div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('treats child with translate="no" as opaque', function (done) {
      var input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('<div>hello <Place>Untranslated</Place></div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('treats child with translate="yes" as opaque', function (done) {
      var input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('<div>hello <Place>world</Place></div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('adds placeholders for expressions', function (done) {
      var input = '<div translate="yes">hello {place}</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('<div>hello {place}</div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates placeholder names for complex expressions', function (done) {
      var input = '<div translate="yes">hello {place+time}</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('<div>hello {place + time}</div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates wrapper token for child element with text', function (done) {
      var input = '<div translate="yes">hello <b>world</b></div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('<div>hello <b>world</b></div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles nested elements', function (done) {
      var input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('<div>hello <b><i>big</i> <em>world</em></b></div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles number, date, and time helpers', function (done) {
      var input = 'import { number, date, time } from "format-message"\n' +
        'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('number(count)')
        expect(stdout).to.contain('date(d)')
        expect(stdout).to.contain('time(t)')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles select helpers', function (done) {
      var input = 'const sel = require("format-message").select\n' +
        'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('s = gender,')
        expect(stdout).to.contain('s === "female"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles plural & selectordinal helpers', function (done) {
      var input = 'const { plural, selectordinal: o } = require("format-message")\n' +
        'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      exec('packages/format-message-cli/format-message transform -i', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('plural(n, 3, {')
        expect(stdout).to.contain('selectordinal(new Date().getDate(), 0, {')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })
})

describe('format-message transform', function () {
  describe('translate="yes"', function () {
    it('transforms messages from JSX', function (done) {
      var input = 'export default <div translate="yes">hello</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message"')
        expect(stdout).to.not.contain('translate')
        expect(stdout).to.contain('id: "hello_32e420db"')
        expect(stdout).to.contain('default: "hello"')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores empty element except removing translate attribute', function (done) {
      var input = '<div translate="yes"></div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('<div></div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores element with no children except removing translate attribute', function (done) {
      var input = '<div translate="yes" />'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('<div />')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores elements without translate="yes"', function (done) {
      var input = '<div>Untranslated</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('<div>Untranslated</div>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('treats child with translate="no" as opaque', function (done) {
      var input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('id: "hello_0_6169517a"')
        expect(stdout).to.contain('default: "hello <0/>"')
        expect(stdout).to.contain('<Place>Untranslated</Place>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('treats child with translate="yes" as opaque', function (done) {
      var input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('id: "hello_0_6169517a"')
        expect(stdout).to.contain('default: "hello <0/>"')
        expect(stdout).to.contain('id: "world_3e83971e"')
        expect(stdout).to.contain('default: "world"')
        expect(stdout).to.contain('[<Place>')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('adds placeholders for expressions', function (done) {
      var input = '<div translate="yes">hello {place}</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('id: "hello_place_e3c168ce"')
        expect(stdout).to.contain('default: "hello { place }"')
        expect(stdout).to.contain('place: place')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates placeholder names for complex expressions', function (done) {
      var input = '<div translate="yes">hello {place+time}</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message"')
        expect(stdout).to.not.contain('translate="yes"')
        expect(stdout).to.contain('id: "hello_place_time_23aa07ee"')
        expect(stdout).to.contain('default: "hello { place_time }"')
        expect(stdout).to.match(/place_time:\s*place\s*\+\s*time/)
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates wrapper token for child element with text', function (done) {
      var input = '<div translate="yes">hello <b>world</b></div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message/react"')
        expect(stdout).to.contain('id: "hello_0_world_0_874c3940"')
        expect(stdout).to.contain('default: "hello <0>world</0>"')
        expect(stdout).to.contain('[<b />]')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('--jsx-target', function (done) {
      var input = '<div translate="yes">hello <b>world</b></div>'
      exec('packages/format-message-cli/format-message transform --jsx-target inferno', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message/inferno"')
        expect(stdout).to.contain('id: "hello_0_world_0_874c3940"')
        expect(stdout).to.contain('default: "hello <0>world</0>"')
        expect(stdout).to.contain('[<b />]')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('-j', function (done) {
      var input = '<div translate="yes">hello <b>world</b></div>'
      exec('packages/format-message-cli/format-message transform -j inferno', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('from "format-message/inferno"')
        expect(stdout).to.contain('id: "hello_0_world_0_874c3940"')
        expect(stdout).to.contain('default: "hello <0>world</0>"')
        expect(stdout).to.contain('[<b />]')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles nested elements', function (done) {
      var input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('id: "hello_0_1_big_1_2_world_2_0_ea7be782"')
        expect(stdout).to.contain('default: "hello <0><1>big</1> <2>world</2></0>"')
        expect(stdout).to.contain('[<b />, <i />, <em />]')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('groups nested elements with no text', function (done) {
      var input = '<div translate="yes">hello <b><i/><em/></b>world</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('id: "hello_0_world_35eac72f"')
        expect(stdout).to.contain('default: "hello <0/>world"')
        expect(stdout).to.contain('[<b><i /><em /></b>]')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles number, date, and time helpers', function (done) {
      var input = 'import { number, date, time } from "format-message"\n' +
        'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('id: "caught_count_number_on_d_date_short_at_t_time_4c96b100"')
        expect(stdout).to.contain('default: "Caught { count, number } on { d, date, short } at { t, time }"')
        expect(stdout).to.contain('count: count')
        expect(stdout).to.contain('d: d')
        expect(stdout).to.contain('t: t')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles select helpers', function (done) {
      var input = 'const sel = require("format-message").select\n' +
        'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('id: "gender_select_female_0_male_1_b_1_other_no_b965b266"')
        expect(stdout).to.contain('[<i />, <b />]')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles plural & selectordinal helpers', function (done) {
      var input = 'const { plural, selectordinal: o } = require("format-message")\n' +
        'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      exec('packages/format-message-cli/format-message transform', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8').trim()
        expect(stdout).to.contain('id: "n_plural_offset_3_one_1_other_o_v_new_date_get_dat_90dd7dec"')
        expect(stdout).to.contain('new_date_get_date: new Date().getDate()')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })
})
