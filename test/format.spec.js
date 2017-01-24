/* eslint-env mocha */
if (typeof Intl === 'undefined') {
  require('intl')
  require('intl/locale-data/jsonp/en')
}
var expect = require('chai').expect
var plurals = require('../packages/format-message-interpret/plurals')
var formatMessage = require('format-message')
var literalIdGenerator = require('../packages/format-message-generate-id/literal')

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

    it('handles object with id, default, and description', function () {
      var message = formatMessage({ id: 'foo_bar', default: 'foo bar', description: 'stuff' })
      expect(message).to.equal('foo bar')
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
      ).replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
      // IE adds ltr marks
      expect(message).to.match(/^0 : \d\d?\/\d\d?\/\d{2,4} \d\d?:\d\d/)
    })

    it('handles plurals', function () {
      var message = formatMessage(
        'On {takenDate, date, short} {name} {numPeople, plural, offset:1 =0 {didn\'t carpool.} =1 {drove himself.} other {drove # people.}}',
        { takenDate: new Date(), name: 'Bob', numPeople: 5 }
      ).replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
      // IE adds ltr marks
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
      Object.keys(plurals).forEach(function (locale) {
        for (var n = 0; n <= 200; ++n) {
          var result = formatMessage(pattern, { n: n }, locale)
          expect(result).to.match(/^(zero|one|two|few|many|other)$/)
        }
      })
    })
    it('doesn\'t throw for any locale\'s selectordinal function', function () {
      var pattern = '{n, selectordinal, zero {zero} one {one} two {two} few {few} many {many} other {other}}'
      Object.keys(plurals).forEach(function (locale) {
        for (var n = 0; n <= 200; ++n) {
          var result = formatMessage(pattern, { n: n }, locale)
          expect(result).to.match(/^(zero|one|two|few|many|other)$/)
        }
      })
    })
  })

  describe('setup', function () {
    it('does nothing if you pass nothing', function () {
      expect(function () { formatMessage.setup() }).to.not.throw()
    })

    // uses variables to avoid inlining since the tests are about runtime config
    it('changes the default locale', function () {
      var options = formatMessage.setup({ locale: 'ar' })
      var pattern = '{n,plural,few{few}other{other}}'
      var message = formatMessage(pattern, { n: 3 })
      formatMessage.setup({ locale: 'en' })

      expect(options.locale).to.equal('ar')
      expect(message).to.equal('few')
    })

    it('changes the translation', function () {
      var options = formatMessage.setup({
        locale: 'en',
        translations: { en: {
          'trans-test': { message: 'test-success' },
          'trans-test2': 'test-success2'
        } },
        missingTranslation: 'ignore',
        generateId: function (pattern) { return pattern }
      })
      // use variable to avoid inlining
      var pattern = 'trans-test'
      var message = formatMessage(pattern)
      var pattern2 = 'trans-test2'
      var message2 = formatMessage(pattern2)

      expect(options.missingTranslation).to.equal('ignore')
      expect(message).to.equal('test-success')
      expect(message2).to.equal('test-success2')
    })

    it('changes the missing translation behavior', function () {
      var options = formatMessage.setup({
        locale: 'en',
        translations: { en: {} },
        missingTranslation: 'warning',
        missingReplacement: '!!!'
      })
      var warn = console.warn
      // capturing error message is fickle in node
      console.warn = function () {}

      var id = 'test'
      var pattern = 'translation-test'
      var message = formatMessage({ id: id, default: pattern })
      console.warn = warn
      formatMessage.setup({ missingReplacement: null, translations: null })

      expect(options.missingTranslation).to.equal('warning')
      expect(options.missingReplacement).to.equal('!!!')
      expect(message).to.equal('!!!')
    })

    it('accepts a function for missingReplacement', function () {
      var args
      var options = formatMessage.setup({
        locale: 'en',
        translations: { en: {} },
        missingTranslation: 'ignore',
        missingReplacement: function (pattern, id, locale) {
          args = [ pattern, id, locale ]
          return 'func'
        }
      })

      var id = 'test-' + Date.now() // cache bust
      var pattern = 'translation-test'
      var message = formatMessage({ id: id, default: pattern })
      formatMessage.setup({ missingReplacement: null, translations: null })

      expect(args).to.deep.equal([
        'translation-test', id, 'en'
      ])
      expect(options.missingTranslation).to.equal('ignore')
      expect(options.missingReplacement).to.be.a('function')
      expect(message).to.equal('func')
    })

    it('can throw on missing', function () {
      formatMessage.setup({
        translations: { en: {} },
        missingTranslation: 'error'
      })

      expect(function () {
        var pattern = 'error-test'
        formatMessage(pattern)
      }).to.throw()

      formatMessage.setup({
        missingTranslation: 'warning',
        translations: null
      })
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
          hour: 'numeric',
          minute: 'numeric'
        } },
        missingTranslation: 'warning'
      } })
      var message = formatMessage('{ n, number, perc }', { n: 0.3672 })
        .replace(/\s+/g, '') // IE adds space
      expect(message).to.equal('40%')
      message = formatMessage('{ d, date, day }', { d: new Date('2015/10/19') })
        .replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
      // IE adds ltr marks
      expect(message).to.equal('19')
      message = formatMessage('{ t, time, minute }', { t: new Date('2015/10/19 5:06') })
        .replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
      // IE adds ltr marks
      expect(message).to.match(/^5:06/)
    })
  })

  describe('number', function () {
    it('localizes a number', function () {
      expect(formatMessage.number(12345.67)).to.equal('12,345.67')
    })

    it('uses the style parameter', function () {
      expect(formatMessage.number(12.345, 'integer')).to.equal('12')
    })

    it.skip('uses the locale parameter', function () { // requires full icu data
      expect(formatMessage.number(12.345, '', 'ar')).to.equal('١٢')
    })
  })

  describe('date', function () {
    it('localizes a date', function () {
      var result = formatMessage.date(new Date(2015, 11, 31))
      expect(result).to.equal('Dec 31, 2015')
    })

    it('uses the style parameter', function () {
      var result = formatMessage.date(new Date(2015, 11, 31), 'short')
      expect(result).to.match(/12\/31\/(20)?15/)
    })

    it.skip('uses the locale parameter', function () { // requires full icu data
      var result = formatMessage.date(new Date(2015, 11, 31), '', 'de')
      expect(result).to.equal('31.12.2015')
    })
  })

  describe('time', function () {
    it('localizes a date', function () {
      var result = formatMessage.time(new Date(2015, 11, 31, 5, 16))
      expect(result).to.equal('5:16:00 AM')
    })

    it('uses the style parameter', function () {
      var result = formatMessage.time(new Date(2015, 11, 31, 5, 16), 'short')
      expect(result).to.equal('5:16 AM')
    })

    it.skip('uses the locale parameter', function () { // requires full icu data
      var result = formatMessage.time(new Date(2015, 11, 31, 5, 16), '', 'de')
      expect(result).to.equal('05:16:00')
    })
  })

  describe('select', function () {
    it('returns the matching value', function () {
      var result = formatMessage.select('match', { match: 'one', other: 'other' })
      expect(result).to.equal('one')
    })

    it('returns other when there is no match', function () {
      var result = formatMessage.select('bogus', { other: 1 })
      expect(result).to.equal(1)
    })
  })

  describe('plural', function () {
    it('returns the matching value', function () {
      var result = formatMessage.plural(1, { one: 'one1' })
      expect(result).to.equal('one1')
    })

    it('considers offset for keyword matches', function () {
      var result = formatMessage.plural(2, 1, { one: 'one2' })
      expect(result).to.equal('one2')
    })

    it('ignores offset for exact matches', function () {
      var result = formatMessage.plural(2, 1, { '=2': 'two2' })
      expect(result).to.equal('two2')
    })

    it('considers locale for keyword matches', function () {
      var result = formatMessage.plural(2, { two: 2 }, 'ar')
      expect(result).to.equal(2)
    })

    it('returns other when there is no match', function () {
      var result = formatMessage.select(3, { other: 1 })
      expect(result).to.equal(1)
    })
  })

  describe('selectordinal', function () {
    it('returns the matching value', function () {
      var result = formatMessage.selectordinal(3, { few: 'one1' })
      expect(result).to.equal('one1')
    })

    it('considers offset for keyword matches', function () {
      var result = formatMessage.selectordinal(3, 1, { two: 'one2' })
      expect(result).to.equal('one2')
    })

    it('ignores offset for exact matches', function () {
      var result = formatMessage.selectordinal(2, 1, { '=2': 'two2' })
      expect(result).to.equal('two2')
    })

    it('considers locale for keyword matches', function () {
      var result = formatMessage.selectordinal(1, { one: 2 }, 'hy')
      expect(result).to.equal(2)
      result = formatMessage.selectordinal(2, { two: 1, other: 'o' }, 'en')
      expect(result).to.equal(1)
      result = formatMessage.selectordinal(2, { two: 1, other: 'o' }, 'hy')
      expect(result).to.equal('o')
    })

    it('returns other when there is no match', function () {
      var result = formatMessage.selectordinal(3, { other: 1 })
      expect(result).to.equal(1)
    })
  })

  describe('namespace', function () {
    var ns, options

    beforeEach(function () {
      ns = formatMessage.namespace()
      options = ns.setup({
        locale: 'fr',
        translations: {
          fr: {
            foo: 'bar'
          }
        },
        generateId: literalIdGenerator
      })
    })

    it('setup does not change other namespaces', function () {
      var globalOptions = formatMessage.setup()
      expect(options.transations).not.to.equal(globalOptions.translations)
    })

    it('uses its own configuration', function () {
      expect(ns('foo')).to.equal('bar')
    })
  })
})
