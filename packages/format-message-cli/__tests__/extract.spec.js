/* eslint-env mocha */
var expect = require('chai').expect
var exec = require('./exec')
var fsUtil = require('fs')
var readFileSync = fsUtil.readFileSync
var unlinkSync = fsUtil.unlinkSync

describe('format-message extract', function () {
  describe('input from stdin', function () {
    it('finds and extracts simple strings', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
    })

    it('finds and extracts template strings', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage(`hello`)'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
      expect(stderr).to.equal('')
    })

    it('dedupes repeated patterns', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello");formatMessage(`hello`)'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
      expect(stderr).to.equal('')
    })

    it('handles dotted placeholders', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello {world.msg}", { world: { msg: "world" } })'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello {world.msg}': { message: 'hello { world.msg }' }
      })
      expect(stderr).to.equal('')
    })

    it('finds rich patterns', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage.rich("hello")'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
    })

    it('can output to a -o file', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello");formatMessage(`hello`)'
      var filename = 'packages/format-message-cli/__tests__/translations/extract.underscored_crc32.json'
      var cmd = 'format-message extract -o ' + filename
      var { stdout, stderr } = exec(cmd, input)
      expect(stdout).to.equal('')
      expect(stderr).to.equal('')
      var translations = JSON.parse(readFileSync(filename, 'utf8'))
      unlinkSync(filename)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
    })

    it('can output to a --out-file file', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello");formatMessage(`hello`)'
      var filename = 'packages/format-message-cli/__tests__/translations/extract.underscored_crc32.json'
      var cmd = 'format-message extract --out-file ' + filename
      var { stdout, stderr } = exec(cmd, input)
      expect(stdout).to.equal('')
      expect(stderr).to.equal('')
      var translations = JSON.parse(readFileSync(filename, 'utf8'))
      unlinkSync(filename)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
    })

    it('can output in yaml format', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      var { stdout, stderr } = exec('format-message extract --format yml', input)
      var translations = stdout
      expect(translations).to.eql('en:\n  hello: hello\n')
      expect(stderr).to.equal('')
    })

    it('uses specified -g id type', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world");formatMessage(`hello world`)'
      var cmd = 'format-message extract -g underscored'
      var { stdout, stderr } = exec(cmd, input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello_world: { message: 'hello world' }
      })
      expect(stderr).to.equal('')
    })

    it('uses specified --generate-id id type', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world");formatMessage(`hello world`)'
      var cmd = 'format-message extract --generate-id underscored'
      var { stdout, stderr } = exec(cmd, input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello_world: { message: 'hello world' }
      })
      expect(stderr).to.equal('')
    })

    it('writes to -l locale object', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'format-message extract -l pt --format yml'
      var { stdout, stderr } = exec(cmd, input)
      var translations = stdout
      expect(translations).to.eql('pt:\n  "hello world": hello world\n')
      expect(stderr).to.equal('')
    })

    it('writes to --locale locale object', function () {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'format-message extract --locale en-US --format yml'
      var { stdout, stderr } = exec(cmd, input)
      var translations = stdout
      expect(translations).to.eql('en-US:\n  "hello world": hello world\n')
      expect(stderr).to.equal('')
    })

    it('lexically sorts keys', function () {
      var input = 'import f from "format-message";f("b");f("a");f("c")'
      var cmd = 'format-message extract -g literal'
      var { stdout, stderr } = exec(cmd, input)
      var translations = stdout
      expect(translations).to.eql('{\n' +
        '  "a": {\n    "message": "a"\n  },\n' +
        '  "b": {\n    "message": "b"\n  },\n' +
        '  "c": {\n    "message": "c"\n  }\n' +
      '}')
      expect(stderr).to.equal('')
    })
  })

  describe('reading from files', function () {
    it('can read from a single file', function () {
      var filename = 'packages/format-message/__tests__/index.spec.js'
      var cmd = 'format-message extract ' + filename
      var { stdout, stderr } = exec(cmd, '')
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations['x{ arg }z'].message)
        .to.equal('x{ arg }z')
    })

    it('can read from multiple files', function () {
      var filename = 'test/setup.js packages/format-message/__tests__/index.spec.js'
      var cmd = 'format-message extract ' + filename
      var { stdout, stderr } = exec(cmd, '')
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations['x{ arg }z'].message)
        .to.equal('x{ arg }z')
    })

    it('can read from a glob pattern of multiple files', function () {
      var filename = '"packages/**/*.spec.js"'
      var cmd = 'format-message extract ' + filename
      var { stdout, stderr } = exec(cmd, '')
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations['x{ arg }z'].message)
        .to.equal('x{ arg }z')
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function () {
      var input = 'var f=require("format-message");f("hello")'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
      expect(stderr).to.equal('')
    })

    it('handles multiple function names in function context', function () {
      var input = 'import formatMessage from "format-message"\nfunction foo(){var f=require("format-message");f("hello")}' +
      'function bar(){formatMessage("bye")}'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        bye: { message: 'bye' },
        hello: { message: 'hello' }
      })
      expect(stderr).to.equal('')
    })

    it('finds function name from import', function () {
      var input = 'import __ from "format-message";__("hello")'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
      expect(stderr).to.equal('')
    })

    it('finds function name from default import', function () {
      var input = 'import {default as __} from "format-message";__("hello")'
      var { stdout, stderr } = exec('format-message extract', input)
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
      expect(stderr).to.equal('')
    })

    describe('with custom modules named format-message', function () {
      it('finds function name from require call', function () {
        var input = 'var f=require("./custom/format-message");f("hello")'
        var { stdout, stderr } = exec('format-message extract', input)
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello: { message: 'hello' }
        })
        expect(stderr).to.equal('')
      })

      it('finds function name from import', function () {
        var input = 'import __ from "./custom/format-message";__("hello")'
        var { stdout, stderr } = exec('format-message extract', input)
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello: { message: 'hello' }
        })
        expect(stderr).to.equal('')
      })
    })
  })

  describe('translate="yes"', function () {
    it('extracts messages from JSX', function () {
      var input = '<div translate="yes">hello</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        hello: { message: 'hello' }
      })
    })

    it('ignores empty element', function () {
      var input = '<div translate="yes"></div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({})
    })

    it('ignores element with no children', function () {
      var input = '<div translate="yes" />'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({})
    })

    it('ignores elements without translate="yes"', function () {
      var input = '<div>Untranslated</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({})
    })

    it('treats child with translate="no" as opaque', function () {
      var input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello <0/>': { message: 'hello <0/>' }
      })
    })

    it('treats child with translate="yes" as opaque', function () {
      var input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello <0/>': { message: 'hello <0/>' },
        world: { message: 'world' }
      })
    })

    it('adds placeholders for expressions', function () {
      var input = '<div translate="yes">hello {place}</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello { place }': { message: 'hello { place }' }
      })
    })

    it('ignores empty expressions', function () {
      var input = '<div translate="yes">hello {place}{}</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello { place }': { message: 'hello { place }' }
      })
    })

    it('generates placeholder names for complex expressions', function () {
      var input = '<div translate="yes">hello {place+time}</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello { place_time }': { message: 'hello { place_time }' }
      })
    })

    it('generates placeholder for opaque child element', function () {
      var input = '<div translate="yes">hello <span/></div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello <0/>': { message: 'hello <0/>' }
      })
    })

    it('generates wrapper token for child element with text', function () {
      var input = '<div translate="yes">hello <b>world</b></div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello <0>world</0>': { message: 'hello <0>world</0>' }
      })
    })

    it('handles nested elements', function () {
      var input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello <0><1>big</1> <2>world</2></0>': { message: 'hello <0><1>big</1> <2>world</2></0>' }
      })
    })

    it('groups nested elements with no translatable text', function () {
      var input = '<div translate="yes">hello <b>{}<i/>{""}<em/></b>world</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout.trim())
      expect(translations).to.eql({
        'hello <0/>world': { message: 'hello <0/>world' }
      })
    })

    it('normalizes white space', function () {
      var input = '<div translate="yes">\n' +
      '\thello\n{" "}\n\t<b>\n\t\t<i>\n\t\t\tbig\n' +
      '\t\t</i>\n\t\t<em>world</em>\n\t</b>\n</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'hello <0><1>big</1><2>world</2></0>': { message: 'hello <0><1>big</1><2>world</2></0>' }
      })
    })

    it('handles number, date, and time helpers', function () {
      var input = 'import { number, date, time } from "format-message"\n' +
      'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        'Caught { count, number } on { d, date, short } at { t, time }': {
          message: 'Caught { count, number } on { d, date, short } at { t, time }'
        }
      })
    })

    it('handles select helpers', function () {
      var input = 'var sel = require("format-message").select\n' +
      'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        '{ gender, select, \nfemale {<0/>}\nmale {<1>b</1>}\nother {no} }': {
          message: '{ gender, select,\n  female {<0/>}\n    male {<1>b</1>}\n   other {no}\n}'
        }
      })
    })

    it('handles plural & selectordinal helpers', function () {
      var input = 'var { plural, selectordinal: o } = require("format-message")\n' +
      'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      var { stdout, stderr } = exec('format-message extract', input)
      expect(stderr).to.equal('')
      var translations = JSON.parse(stdout)
      expect(translations).to.eql({
        '{ n, plural, offset:3\none {1}\nother {o} }v{ new_date_get_date, selectordinal, \nother {} }': {
          message: '{ n, plural, offset:3\n    one {1}\n  other {o}\n}v{ new_date_get_date, selectordinal,\n  other {}\n}'
        }
      })
    })
  })
})
