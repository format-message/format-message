/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
const expect = require('chai').expect
const exec = require('./exec')
const fsUtil = require('fs')
const readFileSync = fsUtil.readFileSync
const unlinkSync = fsUtil.unlinkSync
const readdirSync = fsUtil.readdirSync
const rmdirSync = fsUtil.rmdirSync

describe('format-message transform -i', function () {
  describe('stdin', function () {
    it('finds and replaces simple strings', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hello"/)
    })

    it('finds and replaces template strings', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage(`hello`)'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hello"/)
    })

    it('finds and replaces rich messages', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage.rich("hello")'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^[\s*"hello"\s*]/)
    })

    it('handles placeholders', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello {world}", {world:"world"})'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.equal('"hello " + "world";')
    })

    it('handles dotted placeholders', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello {a.b}", {a:{b:"world"}})'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.equal('"hello " + "world";')
    })

    it('handles dotted placeholders for non-literal params', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello {a.b.c}", params)'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.equal('"hello " + ("a.b.c" in params ? params["a.b.c"] : params.a.b.c);')
    })

    it('can output to a -o file', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      const filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      const cmd = 'format-message transform -i -o ' + filename
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      const fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hello"/)
    })

    it('can output to a --out-file file', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      const filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      const cmd = 'format-message transform -i --out-file ' + filename
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      const fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hello"/)
    })
  })

  describe('translations', function () {
    it('uses -t translations', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      const cmd = 'format-message transform -i -g underscored_crc32' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hey everyone"/)
    })

    it('uses --translations translations', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      const cmd = 'format-message transform -i -g underscored_crc32' +
      ' --translations packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(/^"hey everyone"/)
    })

    describe('locale', function () {
      it('uses -l locale', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        const cmd = 'format-message transform -i -g underscored_crc32' +
        ' -l pt' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"oi mundo"/)
      })

      it('uses --locale locale', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        const cmd = 'format-message transform -i -g underscored_crc32' +
        ' --locale pt' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"oi mundo"/)
      })
    })

    describe('generate-id', function () {
      it('uses -g type', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        const cmd = 'format-message transform -i -g underscored_crc32' +
        ' -g underscored' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"hey everyone"/)
      })

      it('uses --generate-id type', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
        const cmd = 'format-message transform -i' +
        ' --generate-id normalized' +
        ' -t packages/format-message-cli/__tests__/translations/inline.normalized.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"hey everyone"/)
      })
    })

    describe('missing-translation', function () {
      it('causes a fatal error by default', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        const cmd = 'format-message transform -i' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        expect(function () { exec(cmd, input) })
          .to.throw('No en translation found')
      })

      it('can trigger a non-fatal warning instead with -e warning ', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        const cmd = 'format-message transform -i' +
        ' -e warning' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.match(/No en translation found/)
        expect(stdout.trim()).to.match(/^"not translated"/)
      })

      it('can be ignored with --missing-translation ignore', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        const cmd = 'format-message transform -i' +
        ' --missing-translation ignore' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"not translated"/)
      })

      it('can be replaced with -m replacement', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        const cmd = 'format-message transform -i' +
        ' -e ignore' +
        ' -m "!!MISSING!!"' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"!!MISSING!!"/)
      })

      it('can be replaced with --missing-replacement', function () {
        const input = 'import formatMessage from "format-message"\nformatMessage("not translated")'
        const cmd = 'format-message transform -i' +
        ' -e ignore' +
        ' --missing-replacement "!!MISSING!!"' +
        ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
        const { stdout, stderr } = exec(cmd, input)
        expect(stderr).to.equal('')
        expect(stdout.trim()).to.match(/^"!!MISSING!!"/)
      })
    })
  })

  describe('source-maps-inline', function () {
    it('uses --source-maps-inline', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      const cmd = 'format-message transform -i -g underscored_crc32' +
      ' --source-maps-inline' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json'
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout.trim()).to.match(
        /^"hey everyone";?\s+\/\/# sourceMappingURL=data:application\/json/
      )
    })
  })

  describe('source-maps', function () {
    it('uses -s', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      const filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      const cmd = 'format-message transform -i -g underscored_crc32' +
      ' -s' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json' +
      ' --out-file ' + filename
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      const fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hey everyone"/)
      const sourceMap = readFileSync(filename + '.map', 'utf8')
      unlinkSync(filename + '.map')
      expect(JSON.parse(sourceMap)).to.not.be.empty
    })

    it('uses --source-maps', function () {
      const input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      const filename = 'packages/format-message-cli/__tests__/translations/inline.js'
      const cmd = 'format-message transform -i -g underscored_crc32' +
      ' --source-maps' +
      ' -t packages/format-message-cli/__tests__/translations/inline.underscored_crc32.json' +
      ' --out-file ' + filename
      const { stdout, stderr } = exec(cmd, input)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      const fileContent = readFileSync(filename, 'utf8')
      unlinkSync(filename)
      expect(fileContent.trim()).to.match(/^"hey everyone"/)
      const sourceMap = readFileSync(filename + '.map', 'utf8')
      unlinkSync(filename + '.map')
      expect(JSON.parse(sourceMap)).to.not.be.empty
    })
  })

  describe('out-dir', function () {
    const dirname = 'test/inline'
    const ofiles = readdirSync('packages/format-message/__tests__', 'utf8')
      .filter(function (file) {
        return file.slice(-3) === '.js'
      })

    afterEach(function () {
      const files = readdirSync(dirname, 'utf8')
      files.forEach(function (file) {
        unlinkSync(dirname + '/' + file)
      })
      rmdirSync(dirname)
    })

    it('outputs files to the directory relative to root', function () {
      const cmd = 'format-message transform -i' +
      ' -d ' + dirname +
      ' -r packages/format-message/__tests__' +
      ' packages/format-message/__tests__/*.js'
      const { stdout, stderr } = exec(cmd)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      const files = readdirSync(dirname, 'utf8').sort()
      expect(files).to.be.eql(ofiles.sort())
      const fileContent = readFileSync(dirname + '/index.spec.js', 'utf8')
      expect(fileContent.trim()).to.contain('\'x\' + arg + \'z\'')
    })

    it('uses -s source-maps', function () {
      const cmd = 'format-message transform -i' +
      ' -s' +
      ' -d ' + dirname +
      ' --root packages/format-message/__tests__' +
      ' packages/format-message/__tests__/*.js'
      const { stdout, stderr } = exec(cmd)
      expect(stderr).to.equal('')
      expect(stdout).to.equal('')
      const files = readdirSync(dirname, 'utf8').sort()
      expect(files).to.be.eql(
        ofiles.concat(ofiles.map(function (file) {
          return file + '.map'
        })).sort()
      )
      const fileContent =
        readFileSync(dirname + '/index.spec.js', 'utf8')
          .split('//# sourceMappingURL=')
      expect(fileContent[0].trim()).to.contain('\'x\' + arg + \'z\'')
      expect((fileContent[1] || '').trim()).to.equal('index.spec.js.map')
      const sourceMap = readFileSync(dirname + '/index.spec.js.map', 'utf8')
      expect(JSON.parse(sourceMap)).to.not.be.empty
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function () {
      const input = 'var f=require("format-message");f("hello")'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('f(')
    })

    it('handles multiple function names in function context', function () {
      const input = 'import formatMessage from "format-message"\n' +
      'function foo(){var f=require("format-message");f("hello")}\n' +
      'function bar(){formatMessage("bye")}'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('f(')
      expect(stdout).to.not.contain('formatMessage(')
    })

    it('finds function name from import', function () {
      const input = 'import __ from "format-message";__("hello")'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('__(')
    })

    it('finds function name from default import', function () {
      const input = 'import {default as __} from "format-message";__("hello")'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('__(')
    })
  })

  describe('translate="yes"', function () {
    it('transforms messages from JSX', function () {
      const input = 'export default <div translate="yes">hello</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('export default <div>hello</div>')
    })

    it('ignores empty element except removing translate attribute', function () {
      const input = '<div translate="yes"></div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div></div>')
    })

    it('ignores element with no children except removing translate attribute', function () {
      const input = '<div translate="yes" />'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div />')
    })

    it('ignores elements without translate="yes"', function () {
      const input = '<div>Untranslated</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div>Untranslated</div>')
    })

    it('treats child with translate="no" as opaque', function () {
      const input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <Place>Untranslated</Place></div>')
    })

    it('treats child with translate="yes" as opaque', function () {
      const input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <Place>world</Place></div>')
    })

    it('adds placeholders for expressions', function () {
      const input = '<div translate="yes">hello {place}</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello {place}</div>')
    })

    it('generates placeholder names for complex expressions', function () {
      const input = '<div translate="yes">hello {place+time}</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello {place + time}</div>')
    })

    it('generates wrapper token for child element with text', function () {
      const input = '<div translate="yes">hello <b>world</b></div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <b>world</b></div>')
    })

    it('handles nested elements', function () {
      const input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('<div>hello <b><i>big</i> <em>world</em></b></div>')
    })

    it('handles number, date, and time helpers', function () {
      const input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('number(count)')
      expect(stdout).to.contain('date(d)')
      expect(stdout).to.contain('time(t)')
    })

    it('handles select helpers', function () {
      const input = 'const sel = require("format-message").select\n' +
      'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
      expect(stderr).to.equal('')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('s = gender,')
      expect(stdout).to.contain('s === "female"')
    })

    it('handles plural & selectordinal helpers', function () {
      const input = 'const { plural, selectordinal: o } = require("format-message")\n' +
      'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      const { stdout, stderr } = exec('format-message transform -i', input)
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
      const input = 'export default <div translate="yes">hello</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello"')
      expect(stdout).to.contain('default: "hello"')
    })

    it('ignores empty element except removing translate attribute', function () {
      const input = '<div translate="yes"></div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div></div>')
    })

    it('ignores element with no children except removing translate attribute', function () {
      const input = '<div translate="yes" />'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div />')
    })

    it('ignores elements without translate="yes"', function () {
      const input = '<div>Untranslated</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('<div>Untranslated</div>')
    })

    it('treats child with translate="no" as opaque', function () {
      const input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello { 0 }"')
      expect(stdout).to.contain('default: "hello { 0 }"')
      expect(stdout).to.contain('<Place key="0">Untranslated</Place>')
    })

    it('treats child with translate="yes" as opaque', function () {
      const input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello { 0 }"')
      expect(stdout).to.contain('default: "hello { 0 }"')
      expect(stdout).to.contain('id: "world"')
      expect(stdout).to.contain('default: "world"')
      expect(stdout).to.contain('[<Place key="0">')
    })

    it('adds placeholders for expressions', function () {
      const input = '<div translate="yes">hello {place}</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello { place }"')
      expect(stdout).to.contain('default: "hello { place }"')
      expect(stdout).to.contain('place: place')
    })

    it('generates placeholder names for complex expressions', function () {
      const input = '<div translate="yes">hello {place+time}</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello { place_time }"')
      expect(stdout).to.contain('default: "hello { place_time }"')
      expect(stdout).to.match(/place_time:\s*place\s*\+\s*time/)
    })

    it('generates token for child element with text', function () {
      const input = '<div translate="yes">hello <b>world</b></div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('from "format-message"')
      expect(stdout).to.not.contain('translate="yes"')
      expect(stdout).to.contain('.rich({')
      expect(stdout).to.contain('id: "hello <0>world</0>"')
      expect(stdout).to.contain('default: "hello <0>world</0>"')
      expect(stdout).to.contain('0: (children) => <b key="0">{children}</b>')
    })

    it('handles nested elements', function () {
      const input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "hello <0><1>big</1> <2>world</2></0>"')
      expect(stdout).to.contain('default: "hello <0><1>big</1> <2>world</2></0>"')
      expect(stdout).to.contain('0: (children) => <b key="0">{children}</b>')
      expect(stdout).to.contain('1: (children) => <i key="1">{children}</i>')
      expect(stdout).to.contain('2: (children) => <em key="2">{children}</em>')
    })

    it('prefers the key attribute', function () {
      const input = '<div translate="yes">name <b key="b"><i key="icon" /> required</b></div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "name <b>{ icon } required</b>"')
      expect(stdout).to.contain('default: "name <b>{ icon } required</b>"')
      expect(stdout).to.contain('icon: <i key="icon" />')
      expect(stdout).to.contain('b: (children) => <b key="b">{children}</b>')
    })

    it('groups nested elements with no text', function () {
      const input = '<div translate="yes">hello <b><i/><em/></b>world</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "hello { 0 }world"')
      expect(stdout).to.contain('default: "hello { 0 }world"')
      expect(stdout).to.contain('0: <b key="0"><i /><em /></b>')
    })

    it('handles style names with spaces', function () {
      const input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "MMM d")} at {time(t)}</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "Caught { count, number } on { d, date, \'MMM d\' } at { t, time }"')
      expect(stdout).to.contain('default: "Caught { count, number } on { d, date, \'MMM d\' } at { t, time }"')
      expect(stdout).to.contain('count: count')
      expect(stdout).to.contain('d: d')
      expect(stdout).to.contain('t: t')
    })

    it('handles number, date, and time helpers', function () {
      const input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "Caught { count, number } on { d, date, short } at { t, time }"')
      expect(stdout).to.contain('default: "Caught { count, number } on { d, date, short } at { t, time }"')
      expect(stdout).to.contain('count: count')
      expect(stdout).to.contain('d: d')
      expect(stdout).to.contain('t: t')
    })

    it('handles select helpers', function () {
      const input = 'const sel = require("format-message").select\n' +
      'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "{ gender, select, \\nfemale {{ 0 }}\\nmale {<1>b</1>}\\nother {no} }"')
      expect(stdout).to.contain('0: <i key="0" />')
      expect(stdout).to.contain('1: (children) => <b key="1">{children}</b>')
    })

    it('handles plural & selectordinal helpers', function () {
      const input = 'const { plural, selectordinal: o } = require("format-message")\n' +
      'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      const { stdout, stderr } = exec('format-message transform', input)
      expect(stderr).to.equal('')
      expect(stdout).to.contain('id: "{ n, plural, offset:3\\none {1}\\nother {o} }v{ new_date_get_date, selectordinal, \\nother {} }"')
      expect(stdout).to.contain('new_date_get_date: new Date().getDate()')
    })
  })
})
