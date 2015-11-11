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
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations).to.eql({
          hello_32e420db: { message: 'hello' }
        })
        expect(stderr.toString('utf8')).to.equal('')
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
  })

  describe('reading from files', function () {
    it('can read from a single file', function (done) {
      var filename = 'test/format.spec.js'
      var cmd = 'packages/format-message-cli/format-message extract ' + filename
      exec(cmd, function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations.x_arg_z_c6ca7a80.message)
          .to.equal('x{ arg }z')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      })
    })

    it('can read from multiple files', function (done) {
      var filename = 'test/setup.js test/format.spec.js'
      var cmd = 'packages/format-message-cli/format-message extract ' + filename
      exec(cmd, function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations.x_arg_z_c6ca7a80.message)
          .to.equal('x{ arg }z')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      })
    })

    it('can read from a glob pattern of multiple files', function (done) {
      var filename = 'test/**/*.spec.js'
      var cmd = 'packages/format-message-cli/format-message extract ' + filename
      exec(cmd, function (err, stdout, stderr) {
        stdout = stdout.toString('utf8')
        var translations = JSON.parse(stdout)
        expect(translations.x_arg_z_c6ca7a80.message)
          .to.equal('x{ arg }z')
        expect(stderr.toString('utf8')).to.equal('')
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
  })
})
