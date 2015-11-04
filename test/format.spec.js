/* eslint-env mocha */
if (typeof Intl === 'undefined') {
  require('intl')
  require('intl/locale-data/jsonp/en')
}
var expect = require('chai').expect
var MessageFormat = require('message-format')
var formatMessage = require('../packages/format-message')

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
    it('changes the default locale', function () {
      formatMessage.setup({ locale: 'ar' })
      var pattern = '{n,plural,few{few}other{other}}'
      var message = formatMessage(pattern, { n: 3 })
      formatMessage.setup({ locale: 'en' })

      expect(message).to.equal('few')
    })

    it('changes the translation', function () {
      formatMessage.setup({
        locale: 'en',
        translations: { en: { 'trans-test': 'test-success' } },
        missingTranslation: 'ignore',
        generateId: function (pattern) { return pattern }
      })
      // use variable to avoid inlining
      var pattern = 'trans-test'
      var message = formatMessage(pattern)

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
})
