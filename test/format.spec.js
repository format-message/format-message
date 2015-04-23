/*eslint-env mocha */
if (typeof Intl === 'undefined') { require('intl') }
import { expect } from 'chai'
import MessageFormat from 'message-format'
import formatMessage from '../src/format-message'

describe('formatMessage', () => {
  describe('formatMessage', () => {
    it('formats a simple message', () => {
      const message = formatMessage('Simple string with nothing special')
      expect(message).to.equal('Simple string with nothing special')
    })

    it('handles pattern with escaped text', () => {
      const message = formatMessage('This isn\'\'t a \'{\'\'simple\'\'}\' \'string\'')
      expect(message).to.equal('This isn\'t a {\'simple\'} \'string\'')
    })

    it('accepts arguments', () => {
      const arg = 'y'
      const message = formatMessage('x{ arg }z', { arg })
      expect(message).to.equal('xyz')
    })

    it('formats numbers, dates, and times', () => {
      const d = new Date(0)
      const message = formatMessage(
        '{ n, number } : { d, date, short } { d, time, short }',
        { n: 0, d }
      )
      expect(message).to.match(/^0 \: \d\d?\/\d\d?\/\d{2,4} \d\d?\:\d\d/)
    })

    it('handles plurals', () => {
      const message = formatMessage(
        `On {takenDate, date, short} {name} {numPeople, plural, offset:1
            =0 {didn't carpool.}
            =1 {drove himself.}
         other {drove # people.}}`,
        { takenDate: new Date(), name: 'Bob', numPeople: 5 }
      )
      expect(message).to.match(/^On \d\d?\/\d\d?\/\d{2,4} Bob drove 4 people.$/)
    })

    it('handles plurals for other locales', () => {
      expect(formatMessage(`{n, plural,
        zero {zero}
         one {one}
         two {two}
         few {few}
        many {many}
       other {other}}`, { n: 0 }, 'ar')).to.equal('zero')
      expect(formatMessage(`{n, plural,
        zero {zero}
         one {one}
         two {two}
         few {few}
        many {many}
       other {other}}`, { n: 1 }, 'ar')).to.equal('one')
      expect(formatMessage(`{n, plural,
        zero {zero}
         one {one}
         two {two}
         few {few}
        many {many}
       other {other}}`, { n: 2 }, 'ar')).to.equal('two')
      expect(formatMessage(`{n, plural,
        zero {zero}
         one {one}
         two {two}
         few {few}
        many {many}
       other {other}}`, { n: 3 }, 'ar')).to.equal('few')
      expect(formatMessage(`{n, plural,
        zero {zero}
         one {one}
         two {two}
         few {few}
        many {many}
       other {other}}`, { n: 11 }, 'ar')).to.equal('many')
    })

    it('handles select', () => {
      const message = formatMessage(`{ gender, select,
           male {it's his turn}
         female {it's her turn}
          other {it's their turn}}`,
        { gender: 'female' }
      )
      expect(message).to.equal('it\'s her turn')
    })
  })

  describe('locales', () => {
    it('doesn\'t throw for any locale\'s plural function', () => {
      const pattern =
        `{n, plural,
          zero {zero}
           one {one}
           two {two}
           few {few}
          many {many}
         other {other}}`
      for (let locale of MessageFormat.supportedLocalesOf()) {
        for (let n = 0; n <= 200; ++n) {
          const result = formatMessage(pattern, { n }, locale)
          expect(result).to.match(/^(zero|one|two|few|many|other)$/)
        }
      }
    })
  })

  describe('setup', () => {
    // uses variables to avoid inlining since the tests are about runtime config
    it('changes the caching', () => {
      const pattern = 'cache-test'
      delete MessageFormat.data.formats.cache['en:format:cache-test']
      formatMessage.setup({ cache: false })
      formatMessage(pattern)
      formatMessage.setup({ cache: true })

      expect(MessageFormat.data.formats.cache['en:format:cache-test']).to.not.exist
      formatMessage(pattern)
      expect(MessageFormat.data.formats.cache['en:format:cache-test']).to.exist
    })

    it('changes the default locale', () => {
      formatMessage.setup({ locale: 'ar' })
      const pattern = '{n,plural,few{few}other{other}}'
      const message = formatMessage(pattern, { n: 3 })
      formatMessage.setup({ locale: 'en' })

      expect(message).to.equal('few')
    })

    it('changes the translation', () => {
      formatMessage.setup({ translate () { return 'test-success' } })
      // use variable to avoid inlining
      const pattern = 'trans-test'
      const message = formatMessage(pattern)
      formatMessage.setup({ translate (pattern) { return pattern } })

      expect(message).to.equal('test-success')
    })
  })

  describe('translate', () => {
    it('looks up the translated pattern', () => {
      formatMessage.setup({ translate (pattern) { return 'translated' } })
      // use variable to avoid inlining
      const originalPattern = 'trans-test'
      const pattern = formatMessage.translate(originalPattern)
      formatMessage.setup({ translate (pattern) { return pattern } })

      expect(pattern).to.equal('translated')
    })
  })
})
