import { exec } from 'child_process'

describe('message-format lint', () => {

	describe('input from stdin', () => {

		it('outputs nothing when no errors found', done => {
			let input = 'format("hello")'
			exec('bin/message-format lint', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.equal('')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('reports errors from stdin input to stderr', done => {
			let input = 'format("{")'
			exec('bin/message-format lint', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.match(/^SyntaxError\:/)
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('reports filename as "stdin" by default', done => {
			let input = 'format("{")'
			exec('bin/message-format lint', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.contain('at format (stdin:1:0)')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('reports passed -f filename in errors', done => {
			let input = 'format("{")'
			exec('bin/message-format lint -f a-file-name.js', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8'))
					.to.contain('at format (a-file-name.js:1:0)')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('reports passed --filename filename in errors', done => {
			let input = 'format("{")'
			exec('bin/message-format lint --filename b-file-name.js', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8'))
					.to.contain('at format (b-file-name.js:1:0)')
				done(err)
			}).stdin.end(input, 'utf8')
		})

	})


	describe('colors', () => {

		it('outputs in color when specified', done => {
			let input = 'format(top);format("{")'
			exec('bin/message-format lint --color', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.contain('\x1b[')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('outputs without color when specified', done => {
			let input = 'format(top);format("{")'
			exec('bin/message-format lint --no-color', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.not.contain('\x1b[')
				done(err)
			}).stdin.end(input, 'utf8')
		})

	})


	describe('function name', () => {

		it('finds functions with specified -n name', done => {
			let input = '__(top)'
			exec('bin/message-format lint -n __', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.equal(
					'Warning: called without a literal pattern\n    at __ (stdin:1:0)\n'
				)
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('finds functions with specified --function-name name', done => {
			let input = '__(top)'
			exec('bin/message-format lint --function-name __', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.equal(
					'Warning: called without a literal pattern\n    at __ (stdin:1:0)\n'
				)
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('doesn\'t find method calls with the specified name (__)', done => {
			let input = 'top.__(top)'
			exec('bin/message-format lint -n __', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.equal('')
				done(err)
			}).stdin.end(input, 'utf8')
		})


		it('doesn\'t find method calls with the specified name (format)', done => {
			let input = 'top.format("{")'
			exec('bin/message-format lint', (err, stdout, stderr) => {
				expect(stdout.toString('utf8')).to.equal('')
				expect(stderr.toString('utf8')).to.equal('')
				done(err)
			}).stdin.end(input, 'utf8')
		})

	})

})

