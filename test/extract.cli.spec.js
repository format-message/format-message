/* eslint-env mocha */
var expect = require('chai').expect
var exec = require('child_process').exec
var fsUtil = require('fs')
var readFileSync = fsUtil.readFileSync
var unlinkSync = fsUtil.unlinkSync

describe('format-message extract', function () {
  describe('input from stdin', function () {
    it('finds and extracts simple strings', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and extracts template strings', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage(`hello`)'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('dedupes repeated patterns', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello");formatMessage(`hello`)'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a -o file', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello");formatMessage(`hello`)'
      var filename = 'test/translations/extract.underscored_crc32.json'
      var cmd = 'packages/format-message-cli/format-message extract -o ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        var translations = JSON.parse(readFileSync(filename, 'utf8'))
        unlinkSync(filename)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a --out-file file', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello");formatMessage(`hello`)'
      var filename = 'test/translations/extract.underscored_crc32.json'
      var cmd = 'packages/format-message-cli/format-message extract --out-file ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        var translations = JSON.parse(readFileSync(filename, 'utf8'))
        unlinkSync(filename)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output in yaml format', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello")'
      exec('packages/format-message-cli/format-message extract --format yml', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = stdout
        expect(translations).to.eql('en:\n  hello_32e420db: hello\n')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses specified -g id type', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world");formatMessage(`hello world`)'
      var cmd = 'packages/format-message-cli/format-message extract -g underscored'
      exec(cmd, function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_world: { message: 'hello world' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses specified --generate-id id type', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world");formatMessage(`hello world`)'
      var cmd = 'packages/format-message-cli/format-message extract --generate-id underscored'
      exec(cmd, function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_world: { message: 'hello world' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('writes to -l locale object', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message extract -l pt --format yml'
      exec(cmd, function (err, stdout, stderr) {
        var translations = stdout.toString('utf8')
        expect(translations).to.eql('pt:\n  hello_world_a55e96a3: hello world\n')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('writes to --locale locale object', function (done) {
      var input = 'import formatMessage from "format-message"\nformatMessage("hello world")'
      var cmd = 'packages/format-message-cli/format-message extract --locale en-US --format yml'
      exec(cmd, function (err, stdout, stderr) {
        var translations = stdout.toString('utf8')
        expect(translations).to.eql('en-US:\n  hello_world_a55e96a3: hello world\n')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('lexically sorts keys', function (done) {
      var input = 'import f from "format-message";f("b");f("a");f("c")'
      var cmd = 'packages/format-message-cli/format-message extract -g literal'
      exec(cmd, function (err, stdout, stderr) {
        var translations = stdout.toString('utf8')
        expect(translations).to.eql('{\n' +
          '  "a": {\n    "message": "a"\n  },\n' +
          '  "b": {\n    "message": "b"\n  },\n' +
          '  "c": {\n    "message": "c"\n  }\n' +
        '}')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('reading from files', function () {
    it('can read from a single file', function (done) {
      var filename = 'test/format.spec.js'
      var cmd = 'packages/format-message-cli/format-message extract ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations.x_arg_z_c6ca7a80.message)
          .to.equal('x{ arg }z')
        done(err)
      })
    })

    it('can read from multiple files', function (done) {
      var filename = 'test/setup.js test/format.spec.js'
      var cmd = 'packages/format-message-cli/format-message extract ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations.x_arg_z_c6ca7a80.message)
          .to.equal('x{ arg }z')
        done(err)
      })
    })

    it('can read from a glob pattern of multiple files', function (done) {
      var filename = '"test/**/*.spec.js"'
      var cmd = 'packages/format-message-cli/format-message extract ' + filename
      exec(cmd, function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations.x_arg_z_c6ca7a80.message)
          .to.equal('x{ arg }z')
        done(err)
      })
    })
  })

  describe('autodetect function name', function () {
    it('finds function name from require call', function (done) {
      var input = 'var f=require("format-message");f("hello")'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles multiple function names in function context', function (done) {
      var input = 'import formatMessage from "format-message"\nfunction foo(){var f=require("format-message");f("hello")}' +
        'function bar(){formatMessage("bye")}'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          bye_374365a8: { message: 'bye' },
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds function name from import', function (done) {
      var input = 'import __ from "format-message";__("hello")'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds function name from default import', function (done) {
      var input = 'import {default as __} from "format-message";__("hello")'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    describe('with custom modules named format-message', function () {
      it('finds function name from require call', function (done) {
        var input = 'var f=require("./custom/format-message");f("hello")'
        exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
          stdout = stdout.toString('utf8')
          var translations = JSON.parse(stdout)
          expect(translations).to.eql({
            hello_32e420db: { message: 'hello' }
          })
          expect(stderr.toString('utf8')).to.equal('')
          done(err)
        }).stdin.end(input, 'utf8')
      })

      it('finds function name from import', function (done) {
        var input = 'import __ from "./custom/format-message";__("hello")'
        exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
          stdout = stdout.toString('utf8')
          var translations = JSON.parse(stdout)
          expect(translations).to.eql({
            hello_32e420db: { message: 'hello' }
          })
          expect(stderr.toString('utf8')).to.equal('')
          done(err)
        }).stdin.end(input, 'utf8')
      })
    })
  })

  describe('translate="yes"', function () {
    it('extracts messages from JSX', function (done) {
      var input = '<div translate="yes">hello</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores empty element', function (done) {
      var input = '<div translate="yes"></div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({})
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores element with no children', function (done) {
      var input = '<div translate="yes" />'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({})
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores elements without translate="yes"', function (done) {
      var input = '<div>Untranslated</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({})
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('treats child with translate="no" as opaque', function (done) {
      var input = '<div translate="yes">hello <Place translate="no">Untranslated</Place></div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_0_6169517a: { message: 'hello <0/>' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('treats child with translate="yes" as opaque', function (done) {
      var input = '<div translate="yes">hello <Place translate="yes">world</Place></div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_0_6169517a: { message: 'hello <0/>' },
          world_3e83971e: { message: 'world' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('adds placeholders for expressions', function (done) {
      var input = '<div translate="yes">hello {place}</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_place_e3c168ce: { message: 'hello { place }' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('ignores empty expressions', function (done) {
      var input = '<div translate="yes">hello {place}{}</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_place_e3c168ce: { message: 'hello { place }' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates placeholder names for complex expressions', function (done) {
      var input = '<div translate="yes">hello {place+time}</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_place_time_23aa07ee: { message: 'hello { place_time }' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates placeholder for opaque child element', function (done) {
      var input = '<div translate="yes">hello <span/></div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_0_6169517a: { message: 'hello <0/>' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('generates wrapper token for child element with text', function (done) {
      var input = '<div translate="yes">hello <b>world</b></div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_0_world_0_874c3940: { message: 'hello <0>world</0>' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles nested elements', function (done) {
      var input = '<div translate="yes">hello <b><i>big</i> <em>world</em></b></div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_0_1_big_1_2_world_2_0_ea7be782: { message: 'hello <0><1>big</1> <2>world</2></0>' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('normalizes white space', function (done) {
      var input = '<div translate="yes">\n' +
        '\thello\n{" "}\n\t<b>\n\t\t<i>\n\t\t\tbig\n' +
        '\t\t</i>\n\t\t<em>world</em>\n\t</b>\n</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_0_1_big_1_2_world_2_0_9e3f6e63: { message: 'hello <0><1>big</1><2>world</2></0>' }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles number, date, and time helpers', function (done) {
      var input = 'import { number, date, time } from "format-message"\n' +
        'export default <div translate="yes">Caught {number(count)} on {date(d, "short")} at {time(t)}</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          caught_count_number_on_d_date_short_at_t_time_4c96b100: {
            message: 'Caught { count, number } on { d, date, short } at { t, time }'
          }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles select helpers', function (done) {
      var input = 'const sel = require("format-message").select\n' +
        'export default <div translate="yes">{sel(gender, { female:<i/>, male:<b>b</b>, other:"no" })}</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          gender_select_female_0_male_1_b_1_other_no_b965b266: {
            message: '{ gender, select,\n  female {<0/>}\n    male {<1>b</1>}\n   other {no}\n}'
          }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('handles plural & selectordinal helpers', function (done) {
      var input = 'const { plural, selectordinal: o } = require("format-message")\n' +
        'export default <div translate="yes">{plural(n, 3, { one:"1", other:"o" })}v{o(new Date().getDate(), { other:"" })}</div>'
      exec('packages/format-message-cli/format-message extract', function (err, stdout, stderr) {
        expect(stderr.toString('utf8')).to.equal('')
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          n_plural_offset_3_one_1_other_o_v_new_date_get_dat_90dd7dec: {
            message: '{ n, plural, offset:3\n    one {1}\n  other {o}\n}v{ new_date_get_date, selectordinal,\n  other {}\n}'
          }
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })
})
