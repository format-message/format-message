/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
var expect = require('chai').expect
var exec = require('./exec')
var fsUtil = require('fs')
var readFileSync = fsUtil.readFileSync
var unlinkSync = fsUtil.unlinkSync
var readdirSync = fsUtil.readdirSync
var rmdirSync = fsUtil.rmdirSync

describe('format-message transform -i', function () {
  describe('stdin', function () {
    it('finds and replaces simple strings', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hello"/)
    })

    it('finds and replaces template strings', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage(`hello`)'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hello"/)
    })

    it('finds and replaces rich messages', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage.rich("hello")'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^\[\s*"hello"\s*\]/)
    })

    it('handles placeholders', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {world}", {world:"world"})'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.equal('"hello " + "world";')
    })

    it('handles dotted placeholders', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {a.b}", {a:{b:"world"}})'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.equal('"hello " + "world";')
    })

    it('handles dotted placeholders for non-literal params', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {a.b.c}", params)'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.equal('"hello " + ("a.b.c" in params ? params["a.b.c"] : params.a.b.c);')
    })

    it('handles custom placeholders', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {a, b, c}", params)'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.contain('"hello " + formatMessage.custom(["a", "b", "c"], "en", params.a, params);')
    })

    it('can output to a -o file', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      var cmd = 'format-message transform -i -o ' + filename
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      var fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hello"/)
    })

    it('can output to a --out-file file', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      var cmd = 'format-message transform -i --out-file ' + filename
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      var fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hello"/)
    })
  })

  describe('translations', function () {
    it('uses -t translations', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'format-message transform -i -g underscored_crc32' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hey everyone"/)
    })

    it('uses --translations translations', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'format-message transform -i -g underscored_crc32' +
      ' --translations packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hey everyone"/)
    })

    describe('locale', function () {
      it('uses -l locale', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'format-message transform -i -g underscored_crc32' +
        ' -l pt' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"oi mundo"/)
      })

      it('uses --locale locale', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'format-message transform -i -g underscored_crc32' +
        ' --locale pt' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"oi mundo"/)
      })
    })

    describe('generate-id', function () {
      it('uses -g type', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'format-message transform -i -g underscored_crc32' +
        ' -g underscored' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"hey everyone"/)
      })

      it('uses --generate-id type', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        var cmd = 'format-message transform -i' +
        ' --generate-id normalized' +
        ' -t packages/format-message-cli/__tests__/translations/inline.normalized.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"hey everyone"/)
      })
    })

    describe('missing-translation', function () {
      it('causes a fatal error by default', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'format-message transform -i' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        expect(function () { exec(cmd, input) })
          .to.throw('No en translation found')
      })

      it('can trigger a non-fatal warning instead with -e warning ', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'format-message transform -i' +
        ' -e warning' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.match(/No en translation found/)
        expect(stdout.trim()).to.match(/^"not translated"/)
      })

      it('can be ignored with --missing-translation ignore', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'format-message transform -i' +
        ' --missing-translation ignore' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"not translated"/)
      })

      it('can be replaced with -m replacement', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'format-message transform -i' +
        ' -e ignore' +
        ' -m "!!MISSING!!"' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"!!MISSING!!"/)
      })

      it('can be replaced with --missing-replacement', function () {
        var input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        var cmd = 'format-message transform -i' +
        ' -e ignore' +
        ' --missing-replacement "!!MISSING!!"' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        var { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"!!MISSING!!"/)
      })
    })
  })

  describe('source-maps-inline', function () {
    it('uses --source-maps-inline', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'format-message transform -i -g underscored_crc32' +
      ' --source-maps-inline' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(
        /^"hey everyone";?\s+\/\/# sourceMappingURL=data:application\/json/
      )
    })
  })

  describe('source-maps', function () {
    it('uses -s', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      var cmd = 'format-message transform -i -g underscored_crc32' +
      ' -s' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json' +
      ' --out-file ' + filename
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      var fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hey everyone"/)
      var sourceMap = readFileSync(filename + '.map', 'utf8')
      unlinkSync(filename + '.map')
      expect(JSON.parse(sourceMap)).to.not.be.empty
    })

    it('uses --source-maps', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      var cmd = 'format-message transform -i -g underscored_crc32' +
      ' --source-maps' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json' +
      ' --out-file ' + filename
      var { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      var fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hey everyone"/)
      var sourceMap = readFileSync(filename + '.map', 'utf8')
      unlinkSync(filename + '.map')
      expect(JSON.parse(sourceMap)).to.not.be.empty
    })
  })

  describe('out-dir', function () {
    var dirname = 'test/inline'
    var ofiles = readdirSync('packages/format-message/__tests__', 'utf8')
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

    it('outputs files to the directory relative to root', function () {
      var cmd = 'format-message transform -i' +
      ' -d ' + dirname +
      ' -r packages/format-message/__tests__' +
      ' packages/format-message/__tests__/*.js'
      var { stdout, stderr } = exec(cmd)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      var files = readdirSync(dirname, 'utf8').sort()
      expect(files).to.be.eql(ofiles.sort())
      var fileContent = readFileSync(dirname + '/index.spec.js', 'utf8')
      expect(fileContent.trim()).to.contain('\'x\' + arg + \'z\'')
    })

    it('uses -s source-maps', function () {
      var cmd = 'format-message transform -i' +
      ' -s' +
      ' -d ' + dirname +
      ' --root packages/format-message/__tests__' +
      ' packages/format-message/__tests__/*.js'
      var { stdout, stderr } = exec(cmd)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      var files = readdirSync(dirname, 'utf8').sort()
      expect(files).to.be.eql(
        ofiles.concat(ofiles.map(function (file) {
          return file + '.map'
        })).sort()
      )
      var fileContent =
        readFileSync(dirname + '/index.spec.js', 'utf8')
          .split('//# sourceMappingURL=')
      expect(fileContent[0].trim()).to.contain('\'x\' + arg + \'z\'')
      expect((fileContent[1] || '').trim()).to.equal('index.spec.js.map')
      var sourceMap = readFileSync(dirname + '/index.spec.js.map', 'utf8')
      expect(JSON.parse(sourceMap)).to.not.be.empty
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function () {
      var input = 'var f=require("format-message");f("hello")'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('f(')
    })

    it('handles multiple function names in function context', function () {
      var input = 'import formatMessage from "format-message"\n' +
      'function foo(){var f=require("format-message");f("hello")}\n' +
      'function bar(){formatMessage("bye")}'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('f(')
      expect(stdout).to.not.contain('formatMessage(')
    })

    it('finds function name from import', function () {
      var input = 'import __ from "format-message";__("hello")'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('__(')
    })

    it('finds function name from default import', function () {
      var input = 'import {default as __} from "format-message";__("hello")'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('__(')
    })
  })

  describe('translate="yes"', function () {
    it('transforms messages from JSX', function () {
      var input = 'export default <div translate="yes">hello</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('export default <div>hello</div>')
    })

    it('ignores empty element except removing translate attribute', function () {
      var input = '<div translate="yes"></div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div></div>')
    })

    it('ignores element with no children except removing translate attribute', function () {
      var input = '<div translate="yes" />'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div />')
    })

    it('ignores elements without translate="yes"', function () {
      var input = '<div>Untranslated</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div>Untranslated</div>')
    })

    it('treats child with translate="no" as opaque', function () {
      var input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <Place>Untranslated</Place></div>')
    })

    it('treats child with translate="yes" as opaque', function () {
      var input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <Place>world</Place></div>')
    })

    it('adds placeholders for expressions', function () {
      var input = '<div translate="yes">hello {place}</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello {place}</div>')
    })

    it('generates placeholder names for complex expressions', function () {
      var input = '<div translate="yes">hello {place+time}</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello {place + time}</div>')
    })

    it('generates wrapper token for child element with text', function () {
      var input = '<div translate="yes">hello <b>world</b></div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <b>world</b></div>')
    })

    it('handles nested elements', function () {
      var input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <b><i>big</i> <em>world</em></b></div>')
    })

    it('handles number, date, and time helpers', function () {
      var input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('number(count)')
      expect(stdout).to.contain('date(d)')
      expect(stdout).to.contain('time(t)')
    })

    it('handles select helpers', function () {
      var input = 'var sel = require("format-message").select\n' +
      'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('s = gender,')
      expect(stdout).to.contain('s === "female"')
    })

    it('handles plural & selectordinal helpers', function () {
      var input = 'var { plural, selectordinal: o } = require("format-message")\n' +
      'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      var { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('plural(n, 3, {')
      expect(stdout).to.contain('selectordinal(new Date().getDate(), 0, {')
    })
  })
})

describe('format-message transform', function () {
  describe('translate="yes"', function () {
    it('transforms messages from JSX', function () {
      var input = 'export default <div translate="yes">hello</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello"')
      expect(stdout).to.contain('default: "hello"')
    })

    it('ignores empty element except removing translate attribute', function () {
      var input = '<div translate="yes"></div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div></div>')
    })

    it('ignores element with no children except removing translate attribute', function () {
      var input = '<div translate="yes" />'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div />')
    })

    it('ignores elements without translate="yes"', function () {
      var input = '<div>Untranslated</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div>Untranslated</div>')
    })

    it('treats child with translate="no" as opaque', function () {
      var input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello <0/>"')
      expect(stdout).to.contain('default: "hello <0/>"')
      expect(stdout).to.contain('<Place key="0">Untranslated</Place>')
    })

    it('treats child with translate="yes" as opaque', function () {
      var input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello <0/>"')
      expect(stdout).to.contain('default: "hello <0/>"')
      expect(stdout).to.contain('id: "world"')
      expect(stdout).to.contain('default: "world"')
      expect(stdout).to.contain('<Place key="0">')
    })

    it('adds placeholders for expressions', function () {
      var input = '<div translate="yes">hello {place}</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello { place }"')
      expect(stdout).to.contain('default: "hello { place }"')
      expect(stdout).to.contain('place: place')
    })

    it('generates placeholder names for complex expressions', function () {
      var input = '<div translate="yes">hello {place+time}</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello { place_time }"')
      expect(stdout).to.contain('default: "hello { place_time }"')
      expect(stdout).to.match(/place_time:\s*place\s*\+\s*time/)
    })

    it('generates token for child element with text', function () {
      var input = '<div translate="yes">hello <b>world</b></div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello <0>world</0>"')
      expect(stdout).to.contain('default: "hello <0>world</0>"')
      expect(stdout).to.match(/0: \({\s*children: _children\s*}\) => <b key="0">{_children}<\/b>/)
    })

    it('handles nested elements', function () {
      var input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "hello <0><1>big</1> <2>world</2></0>"')
      expect(stdout).to.contain('default: "hello <0><1>big</1> <2>world</2></0>"')
      expect(stdout).to.match(/0: \({\s*children: _children\s*}\) => <b key="0">{_children}<\/b>/)
      expect(stdout).to.match(/1: \({\s*children: _children\s*}\) => <i key="1">{_children}<\/i>/)
      expect(stdout).to.match(/2: \({\s*children: _children\s*}\) => <em key="2">{_children}<\/em>/)
    })

    it('groups nested elements with no text', function () {
      var input = '<div translate="yes">hello <b><i/><em/></b>world</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "hello <0/>world"')
      expect(stdout).to.contain('default: "hello <0/>world"')
      expect(stdout).to.contain('0: <b key="0"><i /><em /></b>')
    })

    it('handles style names with spaces', function () {
      var input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "MMM d")} at {time(t)}</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "Caught { count, number } on { d, date, \'MMM d\' } at { t, time }"')
      expect(stdout).to.contain('default: "Caught { count, number } on { d, date, \'MMM d\' } at { t, time }"')
      expect(stdout).to.contain('count: count')
      expect(stdout).to.contain('d: d')
      expect(stdout).to.contain('t: t')
    })

    it('handles number, date, and time helpers', function () {
      var input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "Caught { count, number } on { d, date, short } at { t, time }"')
      expect(stdout).to.contain('default: "Caught { count, number } on { d, date, short } at { t, time }"')
      expect(stdout).to.contain('count: count')
      expect(stdout).to.contain('d: d')
      expect(stdout).to.contain('t: t')
    })

    it('handles select helpers', function () {
      var input = 'var sel = require("format-message").select\n' +
      'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "{ gender, select, \\nfemale {<0/>}\\nmale {<1>b</1>}\\nother {no} }"')
      expect(stdout).to.contain('0: <i key="0" />')
      expect(stdout).to.match(/1: \({\s*children: _children\s*}\) => <b key="1">{_children}<\/b>/)
    })

    it('handles plural & selectordinal helpers', function () {
      var input = 'var { plural, selectordinal: o } = require("format-message")\n' +
      'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      var { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "{ n, plural, offset:3\\none {1}\\nother {o} }v{ new_date_get_date, selectordinal, \\nother {} }"')
      expect(stdout).to.contain('new_date_get_date: new Date().getDate()')
    })
  })
})
