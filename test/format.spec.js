if ('undefined' === typeof Intl) { require('intl') } // include polyfll for Safari and PhantomJS
import MessageFormat from 'message-format'
import format from '../src/format'

describe('format', () => {

	describe('format', () => {

		it('formats a simple message', () => {
			let message = format('Simple string with nothing special')
			expect(message).toBe('Simple string with nothing special')
		})


		it('handles pattern with escaped text', () => {
			let message = format('This isn\'\'t a \'{\'\'simple\'\'}\' \'string\'')
			expect(message).toBe('This isn\'t a {\'simple\'} \'string\'')
		})


		it('accepts arguments', () => {
			let message = format('x{ arg }z', { arg:'y' })
			expect(message).toBe('xyz')
		})


		it('formats numbers, dates, and times', () => {
			let message = format(
				'{ n, number } : { d, date, short } { d, time, short }',
				{ n:0, d:new Date(0) }
			)
			expect(message).toMatch(/^0 \: \d\d?\/\d\d?\/\d{2,4} \d\d?\:\d\d [AP]M$/)
		})


		it('handles plurals', () => {
			let message = format(
				`On {takenDate, date, short} {name} {numPeople, plural, offset:1
				    =0 {didn't carpool.}
				    =1 {drove himself.}
				 other {drove # people.}}`,
				{ takenDate:new Date(), name:'Bob', numPeople:5 }
			)
			expect(message).toMatch(/^On \d\d?\/\d\d?\/\d{2,4} Bob drove 4 people.$/)
		})


		it('handles plurals for other locales', () => {
			expect(format(`{n, plural,
			  zero {zero}
			   one {one}
			   two {two}
			   few {few}
			  many {many}
			 other {other}}`, { n:0 }, 'ar')).toBe('zero')
			expect(format(`{n, plural,
			  zero {zero}
			   one {one}
			   two {two}
			   few {few}
			  many {many}
			 other {other}}`, { n:1 }, 'ar')).toBe('one')
			expect(format(`{n, plural,
			  zero {zero}
			   one {one}
			   two {two}
			   few {few}
			  many {many}
			 other {other}}`, { n:2 }, 'ar')).toBe('two')
			expect(format(`{n, plural,
			  zero {zero}
			   one {one}
			   two {two}
			   few {few}
			  many {many}
			 other {other}}`, { n:3 }, 'ar')).toBe('few')
			expect(format(`{n, plural,
			  zero {zero}
			   one {one}
			   two {two}
			   few {few}
			  many {many}
			 other {other}}`, { n:11 }, 'ar')).toBe('many')
		})


		it('handles select', () => {
			let message = format(`{ gender, select,
				   male {it's his turn}
				 female {it's her turn}
				  other {it's their turn}}`,
				{ gender:'female' }
			)
			expect(message).toBe('it\'s her turn')
		})

	})


	describe('locales', () => {

		it('doesn\'t throw for any locale\'s plural function', () => {
			let
				pattern =
					`{n, plural,
					  zero {zero}
					   one {one}
					   two {two}
					   few {few}
					  many {many}
					 other {other}}`,
				message,
				result
			for (let locale of MessageFormat.supportedLocalesOf()) {
				for (let n = 0; n <= 200; ++n) {
					result = format(pattern, { n }, locale)
					expect(result).toMatch(/^(zero|one|two|few|many|other)$/)
				}
			}
		})

	})


	describe('setup', () => {
		// uses variables to avoid inlining since the tests are about runtime config

		it('changes the caching', () => {
			let pattern = 'cache-test'
			format.setup({ cache:false })
			format(pattern)
			format.setup({ cache:true })

			expect(MessageFormat.data.formats.cache['en:format:cache-test']).toBeUndefined()
			format(pattern)
			expect(MessageFormat.data.formats.cache['en:format:cache-test']).not.toBeUndefined()
		})


		it('changes the default locale', () => {
			format.setup({ locale:'ar' })
			let
				pattern = '{n,plural,few{few}other{other}}',
				message = format(pattern, { n:3 })
			format.setup({ locale:'en' })

			expect(message).toBe('few')
		})


		it('changes the translation', () => {
			format.setup({ translate() { return 'test-success' } })
			let // use variable to avoid inlining
				pattern = 'trans-test',
				message = format(pattern)
			format.setup({ translate(pattern) { return pattern } })

			expect(message).toBe('test-success')
		})

	})

})

