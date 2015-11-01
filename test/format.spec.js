/* eslint-env mocha */
if (typeof Intl === 'undefined') {
  require('intl')
  require('intl/locale-data/jsonp/en')
}
var expect = require('chai').expect
var MessageFormat = require('message-format')
var formatMessage = require('../lib/format-message')

describe('formatMessage', function () {
  describe('formatMessage', function () {
    it('formats a simple message', function () {
      var message = formatMessage('Simple string with nothing special')
      expect(message).to.equal('Simple string with nothing special')
    })

    it('handles pattern with escaped text', function () {
      var message = formatMessage('This isn\'\'t a \'{\'\'simple\'\'}\' \'string\'')
      expect(message).to.equal('This isn\'t a {\'simple\'} \'string\'')
    })

    it('accepts arguments', function () {
      var arg = 'y'
      var message = formatMessage('x{ arg }z', { arg: arg })
      expect(message).to.equal('xyz')
    })

    it('formats numbers, dates, and times', function () {
      var d = new Date(0)
      var message = formatMessage(
        '{ n, number } : { d, date, short } { d, time, short }',
        { n: 0, d: d }
      )
      expect(message).to.match(/^0 \: \d\d?\/\d\d?\/\d{2,4} \d\d?\:\d\d/)
    })

    it('handles plurals', function () {
      var message = formatMessage(
        'On {takenDate, date, short} {name} {numPeople, plural, offset:1 =0 {didn\'t carpool.} =1 {drove himself.} other {drove # people.}}',
        { takenDate: new Date(), name: 'Bob', numPeople: 5 }
      )
      expect(message).to.match(/^On \d\d?\/\d\d?\/\d{2,4} Bob drove 4 people.$/)
    })

    it('handles plurals for other locales', function () {
      expect(formatMessage(
        '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}',
        { n: 0 }, 'ar')).to.equal('zero')
      expect(formatMessage(
        '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}',
        { n: 1 }, 'ar')).to.equal('one')
      expect(formatMessage(
        '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}',
        { n: 2 }, 'ar')).to.equal('two')
      expect(formatMessage(
        '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}',
        { n: 3 }, 'ar')).to.equal('few')
      expect(formatMessage(
        '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}',
        { n: 11 }, 'ar')).to.equal('many')
    })

    it('handles select', function () {
      var message = formatMessage(
        '{ gender, select, male {it\'s his turn} female {it\'s her turn} other {it\'s their turn}}',
        { gender: 'female' }
      )
      expect(message).to.equal('it\'s her turn')
    })
  })

  describe('locales', function () {
    it('doesn\'t throw for any locale\'s plural function', function () {
      var pattern = '{n, plural, zero {zero} one {one} two {two} few {few} many {many} other {other}}'
      MessageFormat.supportedLocalesOf().forEach(function (locale) {
        for (var n = 0; n <= 200; ++n) {
          var result = formatMessage(pattern, { n: n }, locale)
          expect(result).to.match(/^(zero|one|two|few|many|other)$/)
        }
      })
    })
  })

  describe('setup', function () {
    // uses variables to avoid inlining since the tests are about runtime config
    it('changes the caching', function () {
      var pattern = 'cache-test'
      delete MessageFormat.data.formats.cache['en:format:cache-test']
      formatMessage.setup({ cache: false })
      formatMessage(pattern)
      formatMessage.setup({ cache: true })

      expect(MessageFormat.data.formats.cache['en:format:cache-test']).to.not.exist
      formatMessage(pattern)
      expect(MessageFormat.data.formats.cache['en:format:cache-test']).to.exist
    })

    it('changes the default locale', function () {
      formatMessage.setup({ locale: 'ar' })
      var pattern = '{n,plural,few{few}other{other}}'
      var message = formatMessage(pattern, { n: 3 })
      formatMessage.setup({ locale: 'en' })

      expect(message).to.equal('few')
    })

    it('changes the translation', function () {
      formatMessage.setup({ translate: function () { return 'test-success' } })
      // use variable to avoid inlining
      var pattern = 'trans-test'
      var message = formatMessage(pattern)
      formatMessage.setup({ translate: function (pattern) { return pattern } })

      expect(message).to.equal('test-success')
    })

    it('adds custom formats', function () {
      formatMessage.setup({ formats: {
        number: { perc: {
          style: 'percent',
          maximumSignificantDigits: 1
        } },
        date: { day: {
          day: '2-digit'
        } },
        time: { minute: {
          minute: 'numeric'
        } }
      } })
      var message = formatMessage('{ n, number, perc }', { n: 0.3672 })
      expect(message).to.equal('40%')
      message = formatMessage('{ d, date, day }', { d: new Date('2015/10/19') })
      expect(message).to.equal('19')
      message = formatMessage('{ t, time, minute }', { t: new Date('2015/10/19 5:06') })
      expect(message).to.equal('6')
    })
  })

  describe('translate', function () {
    it('looks up the translated pattern', function () {
      formatMessage.setup({ translate: function (pattern) { return 'translated' } })
      // use variable to avoid inlining
      var originalPattern = 'trans-test'
      var pattern = formatMessage.translate(originalPattern)
      formatMessage.setup({ translate: function (pattern) { return pattern } })

      expect(pattern).to.equal('translated')
    })

    describe('missing', function () {
      it('warns and returns original by default', function () {
        formatMessage.setup({
          translate: function (pattern) {}
        })
        var warn = console.warn
        var warning
        console.warn = function (msg) { warning = msg }
        var originalPattern = 'missing'
        var message = formatMessage.translate(originalPattern)
        expect(message).to.equal('missing')
        expect(warning).to.equal('Warning: no en translation found for "missing"')
        console.warn = warn
        formatMessage.setup({
          translate: function (pattern) { return pattern }
        })
      })

      it('can throw an error', function () {
        formatMessage.setup({
          translate: function (pattern) {},
          missingTranslation: 'error'
        })
        // use variable to avoid inlining
        var originalPattern = 'missing'
        expect(function () { formatMessage.translate(originalPattern) }).to.throw('no en translation found for "missing"')
        formatMessage.setup({
          translate: function (pattern) { return pattern },
          missingTranslation: 'warning'
        })
      })

      it('can ignore and return a specific pattern', function () {
        formatMessage.setup({
          translate: function (pattern) {},
          missingTranslation: 'ignore',
          missingReplacement: 'replaced'
        })
        var originalPattern = 'missing'
        var message = formatMessage.translate(originalPattern)
        expect(message).to.equal('replaced')
        formatMessage.setup({
          translate: function (pattern) { return pattern },
          missingTranslation: 'warning',
          missingReplacement: null
        })
      })
    })
  })
})
