import { exec } from 'child_process'
import { readFileSync, unlinkSync, readdirSync, rmdirSync } from 'fs'

describe('format-message inline', () => {

	describe('stdin', () => {

		it('finds and replaces simple strings', done => {
			let input = 'formatMessage("hello")'
			exec('bin/format-message inline', (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8').trim()).to.equal('"hello"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('finds and replaces template strings', done => {
			let input = 'formatMessage(`hello`)'
			exec('bin/format-message inline', (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8').trim()).to.equal('"hello"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('can output to a -o file', done => {
			let
				input = 'formatMessage("hello")',
				filename = 'test/translations/inline.js',
				cmd = 'bin/format-message inline -o ' + filename
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8')).to.equal('')
				let fileContent = readFileSync(filename, 'utf8')
				unlinkSync(filename)
				expect(fileContent.trim()).to.equal('"hello"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('can output to a --out-file file', done => {
			let
				input = 'formatMessage("hello")',
				filename = 'test/translations/inline.js',
				cmd = 'bin/format-message inline --out-file ' + filename
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8')).to.equal('')
				let fileContent = readFileSync(filename, 'utf8')
				unlinkSync(filename)
				expect(fileContent.trim()).to.equal('"hello"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('finds -n named functions', done => {
			let
				input = '__("hello world")',
				cmd = 'bin/format-message inline -n __'
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8').trim()).to.equal('"hello world"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('finds --function-name named functions', done => {
			let
				input = '$("hello world")',
				cmd = 'bin/format-message inline --function-name $'
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8').trim()).to.equal('"hello world"')
				done(err)
			}).stdin.end(input, 'utf8')
		})

	})


	describe('translations', () => {

		it('uses -t translations', done => {
			let
				input = 'formatMessage("hello world")',
				cmd = 'bin/format-message inline' +
					' -t test/translations/inline.underscored_crc32.json'
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('uses --translations translations', done => {
			let
				input = 'formatMessage("hello world")',
				cmd = 'bin/format-message inline' +
					' --translations test/translations/inline.underscored_crc32.json'
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		describe('locale', () => {

			it('uses -l locale', done => {
				let
					input = 'formatMessage("hello world")',
					cmd = 'bin/format-message inline' +
						' -l pt' +
						' -t test/translations/inline.underscored_crc32.json'
				exec(cmd, (err, stdout, stderr) => {
					expect(stderr.toString('utf8')).to.equal('')
					expect(stdout.toString('utf8').trim()).to.equal('"oi mundo"')
					done(err)
				}).stdin.end(input, 'utf8')
			})


			it('uses --locale locale', done => {
				let
					input = 'formatMessage("hello world")',
					cmd = 'bin/format-message inline' +
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
				let
					input = 'formatMessage("hello world")',
					cmd = 'bin/format-message inline' +
						' -k underscored' +
						' -t test/translations/inline.underscored.json'
				exec(cmd, (err, stdout, stderr) => {
					expect(stderr.toString('utf8')).to.equal('')
					expect(stdout.toString('utf8').trim()).to.equal('"hey everyone"')
					done(err)
				}).stdin.end(input, 'utf8')
			})


			it('uses --key-type key', done => {
				let
					input = 'formatMessage("hello world")',
					cmd = 'bin/format-message inline' +
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
			let
				input = 'formatMessage("hello world")',
				cmd = 'bin/format-message inline' +
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
			let
				input = 'formatMessage("hello world")',
				cmd = 'bin/format-message inline' +
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
			let
				input = 'formatMessage("hello world")',
				filename = 'test/translations/inline.js',
				cmd = 'bin/format-message inline' +
					' -s' +
					' -t test/translations/inline.underscored_crc32.json' +
					' --out-file ' + filename
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8')).to.equal('')
				let fileContent = readFileSync(filename, 'utf8')
				unlinkSync(filename)
				expect(fileContent.trim()).to.match(/^\s*"hey everyone"/)
				let sourceMap = readFileSync(filename + '.map', 'utf8')
				unlinkSync(filename + '.map')
				expect(JSON.parse(sourceMap)).to.not.be.empty
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('uses --source-maps', done => {
			let
				input = 'formatMessage("hello world")',
				filename = 'test/translations/inline.js',
				cmd = 'bin/format-message inline' +
					' --source-maps' +
					' -t test/translations/inline.underscored_crc32.json' +
					' --out-file ' + filename
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8')).to.equal('')
				let fileContent = readFileSync(filename, 'utf8')
				unlinkSync(filename)
				expect(fileContent.trim()).to.match(/^\s*"hey everyone"/)
				let sourceMap = readFileSync(filename + '.map', 'utf8')
				unlinkSync(filename + '.map')
				expect(JSON.parse(sourceMap)).to.not.be.empty
				done(err)
			}).stdin.end(input, 'utf8')
		})

	})


	describe('out-dir', () => {

		let dirname = 'test/inline'


		afterEach(() => {
			let files = readdirSync(dirname, 'utf8')
			for (let file of files) {
				unlinkSync(dirname + '/' + file)
			}
			rmdirSync(dirname)
		})


		it('outputs files to the directory relative to root', done => {
			let cmd = 'bin/format-message inline' +
				' -d ' + dirname +
				' -r test' +
				' test/*.js'
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8')).to.equal('')
				let files = readdirSync(dirname, 'utf8').sort()
				expect(files).to.be.eql([
					'extract.cli.spec.js',
					'format-inline.spec.js',
					'format.spec.js',
					'inline.cli.spec.js',
					'lint.cli.spec.js',
					'setup.js'
				].sort())
				let fileContent = readFileSync(dirname + '/format.spec.js', 'utf8')
				expect(fileContent.trim()).to.contain('"x" + args["arg"] + "z"')
				done(err)
			})
		})


		it('uses -s source-maps', done => {
			let cmd = 'bin/format-message inline' +
				' -s' +
				' -d ' + dirname +
				' --root test' +
				' test/*.js'
			exec(cmd, (err, stdout, stderr) => {
				expect(stderr.toString('utf8')).to.equal('')
				expect(stdout.toString('utf8')).to.equal('')
				let files = readdirSync(dirname, 'utf8').sort()
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
				let fileContent = readFileSync(dirname + '/format.spec.js', 'utf8')
				fileContent = fileContent.split('\/\/# sourceMappingURL=')
				expect(fileContent[0].trim()).to.contain('"x" + args["arg"] + "z"')
				expect((fileContent[1] || '').trim()).to.equal('format.spec.js.map')
				let sourceMap = readFileSync(dirname + '/format.spec.js.map', 'utf8')
				expect(JSON.parse(sourceMap)).to.not.be.empty
				done(err)
			})
		})

	})

})

