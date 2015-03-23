/*eslint-env mocha */
import { expect } from 'chai'
import { exec } from 'child_process'
import { readFileSync, unlinkSync } from 'fs'

describe('format-message extract', () => {
  describe('input from stdin', () => {
    it('finds and extracts simple strings', done => {
      const input = 'formatMessage("hello")'
      exec('bin/format-message extract', (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_32e420db: 'hello'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds and extracts template strings', done => {
      const input = 'formatMessage(`hello`)'
      exec('bin/format-message extract', (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_32e420db: 'hello'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('dedupes repeated patterns', done => {
      const input = 'formatMessage("hello");formatMessage(`hello`)'
      exec('bin/format-message extract', (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_32e420db: 'hello'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a -o file', done => {
      const input = 'formatMessage("hello");formatMessage(`hello`)'
      const filename = 'test/translations/extract.underscored_crc32.json'
      const cmd = 'bin/format-message extract -o ' + filename
      exec(cmd, (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        const translations = JSON.parse(readFileSync(filename, 'utf8'))
        unlinkSync(filename)
        expect(translations.en).to.eql({
          hello_32e420db: 'hello'
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('can output to a --out-file file', done => {
      const input = 'formatMessage("hello");formatMessage(`hello`)'
      const filename = 'test/translations/extract.underscored_crc32.json'
      const cmd = 'bin/format-message extract --out-file ' + filename
      exec(cmd, (err, stdout, stderr) => {
        expect(stdout.toString('utf8')).to.equal('')
        expect(stderr.toString('utf8')).to.equal('')
        const translations = JSON.parse(readFileSync(filename, 'utf8'))
        unlinkSync(filename)
        expect(translations.en).to.eql({
          hello_32e420db: 'hello'
        })
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses specified -k key type', done => {
      const input = 'formatMessage("hello world");formatMessage(`hello world`)'
      const cmd = 'bin/format-message extract -k underscored'
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_world: 'hello world'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('uses specified --key-type key type', done => {
      const input = 'formatMessage("hello world");formatMessage(`hello world`)'
      const cmd = 'bin/format-message extract --key-type underscored'
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_world: 'hello world'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds -n named functions', done => {
      const input = '__("hello world");__(`hello world`)'
      const cmd = 'bin/format-message extract -n __'
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_world_a55e96a3: 'hello world'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('finds --function-name named functions', done => {
      const input = '$("hello world");$(`hello world`)'
      const cmd = 'bin/format-message extract --function-name $'
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en).to.eql({
          hello_world_a55e96a3: 'hello world'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('writes to -l locale object', done => {
      const input = 'formatMessage("hello world")'
      const cmd = 'bin/format-message extract -l pt'
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.pt).to.eql({
          hello_world_a55e96a3: 'hello world'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })

    it('writes to --locale locale object', done => {
      const input = 'formatMessage("hello world")'
      const cmd = 'bin/format-message extract --locale en-US'
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations['en-US']).to.eql({
          hello_world_a55e96a3: 'hello world'
        })
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      }).stdin.end(input, 'utf8')
    })
  })

  describe('reading from files', () => {
    it('can read from a single file', done => {
      const filename = 'test/format.spec.js'
      const cmd = 'bin/format-message extract ' + filename
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en.x_arg_z_c6ca7a80)
          .to.equal('x{ arg }z')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      })
    })

    it('can read from multiple files', done => {
      const filename = 'test/setup.js test/format.spec.js'
      const cmd = 'bin/format-message extract ' + filename
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en.x_arg_z_c6ca7a80)
          .to.equal('x{ arg }z')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      })
    })

    it('can read from a glob pattern of multiple files', done => {
      const filename = 'test/**/*.spec.js'
      const cmd = 'bin/format-message extract ' + filename
      exec(cmd, (err, stdout, stderr) => {
        stdout = stdout.toString('utf8')
        const translations = JSON.parse(stdout)
        expect(translations.en.x_arg_z_c6ca7a80)
          .to.equal('x{ arg }z')
        expect(stderr.toString('utf8')).to.equal('')
        done(err)
      })
    })
  })
})
