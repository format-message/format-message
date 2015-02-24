import { spawnSync } from 'child_process'
let encoding = 'utf8'

describe('message-format lint', () => {

	describe('input from stdin', () => {

		it('outputs nothing when no errors found', () => {
			let
				input = 'format("hello")',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toBe('')
		})


		it('reports errors from stdin input to stderr', () => {
			let
				input = 'format("{")',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toMatch(/^SyntaxError\:/)
		})


		it('reports filename as "stdin" by default', () => {
			let
				input = 'format("{")',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toContain('at format (stdin:1:0)')
		})


		it('reports passed filename in errors', () => {
			let
				input = 'format("}")',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint', '-f', 'a-file-name.js' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toContain('at format (a-file-name.js:1:0)')

			result = spawnSync(
				'bin/message-format',
				[ 'lint', '--filename', 'b-file-name.js' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toContain('at format (b-file-name.js:1:0)')
		})

	})


	describe('colors', () => {

		it('outputs in color when specified', () => {
			let
				input = 'format(top);format("{")',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint', '--color' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toContain('\x1b[')
		})


		it('outputs without color when specified', () => {
			let
				input = 'format(top);format("{")',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint', '--no-color' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).not.toContain('\x1b[')
		})

	})


	describe('function name', () => {

		it('finds functions with specified name', () => {
			let
				input = '__(top)',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint', '-n', '__' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toBe('Warning: called without a literal pattern\n    at __ (stdin:1:0)\n')

			result = spawnSync(
				'bin/message-format',
				[ 'lint', '--function-name', '__' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toBe('Warning: called without a literal pattern\n    at __ (stdin:1:0)\n')
		})


		it('doesn\'t find method calls with the specified name', () => {
			let
				input = 'top.__(top)',
				result
			result = spawnSync(
				'bin/message-format',
				[ 'lint', '-n', '__' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toBe('')

			input = 'foo.format("{")'
			result = spawnSync(
				'bin/message-format',
				[ 'lint' ],
				{ input, encoding }
			)
			expect(result.stdout).toBe('')
			expect(result.stderr).toBe('')
		})

	})

})

