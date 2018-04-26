/* eslint-env mocha */
const expect = require('chai').expect
const formatMessage = require('../../format-message') // needs to match
const runtimeOnly = formatMessage

describe('formatMessage', function () {
  beforeEach(function () {
    formatMessage.setup({
      missingTranslation: 'ignore',
      missingReplacement: null,
      translations: null
    })
  })

  describe('formatMessage', function () {
    it('formats a simple message', function () {
      const message = formatMessage('Simple string with nothing special')
      expect(message).to.equal('Simple string with nothing special')
    })

    it('handles pattern with escaped text', function () {
      const message = formatMessage('This isn\'\'t a \'{\'\'simple\'\'}\' \'string\'')
      expect(message).to.equal('This isn\'t a {\'simple\'} \'string\'')
    })

    it('handles object with id, default, and description', function () {
      const message = formatMessage({ id: 'foo_bar', default: 'foo bar', description: 'stuff' })
      expect(message).to.equal('foo bar')
    })

    it('accepts arguments', function () {
      const arg = 'y'
      const message = formatMessage('x{ arg }z', { arg: arg })
      expect(message).to.equal('xyz')
    })

    it('formats numbers, dates, and times', function () {
      expect(formatMessage('{ n, number }', { n: 1000 })).to.equal('1,000')
      expect(formatMessage('{ n, number, USD }', { n: 1000 })).to.equal('$1,000.00')
      expect(formatMessage('{ d, date, short }', { d: new Date(2010, 5, 14) }))
        .to.include('14')
      expect(formatMessage('{ d, time, short }', { d: new Date(2010, 5, 14, 15, 17) }))
        .to.include('17')
    })

    it('handles plurals', function () {
      const message = formatMessage(
        '{name} {numPeople, plural, offset:1 =0 {didn\'t carpool.} =1 {drove himself.} other {drove # people.}}',
        { name: 'Bob', numPeople: 5 }
      )
      expect(message).to.match(/^Bob drove 4 people.$/)
    })

    it('handles select', function () {
      const message = formatMessage(
        '{ gender, select, male {it\'s his turn} female {it\'s her turn} other {it\'s their turn}}',
        { gender: 'female' }
      )
      expect(message).to.equal('it\'s her turn')
    })

    it('ignores html-like tags', function () {
      expect(formatMessage('</b>')).to.equal('</b>')
    })
  })

  describe('rich', function () {
    it('passes tag contents as children', function () {
      const parts = formatMessage.rich('Click <a>Here</a>!', {
        a: function (props) { return props }
      })
      expect(parts).to.deep.equal([ 'Click ', { children: [ 'Here' ] }, '!' ])
    })

    it('can use <> type directly', function () {
      const parts = formatMessage.rich('Click {a,<>,p{there}}!', {
        a: function (props) { return props }
      })
      expect(parts).to.deep.equal([ 'Click ', { p: [ 'there' ] }, '!' ])
    })

    it('handles string style in <> type', function () {
      // note that the html syntax should never pass a string
      // this is a weird case where the style should probably get translated
      const parts = formatMessage.rich('Click {a,<>,styl}!', {
        a: function (props) { return props }
      })
      expect(parts).to.deep.equal([ 'Click ', 'styl', '!' ])
    })

    it('handles message objects', function () {
      const parts = formatMessage.rich({ default: '{ icon }' }, {
        icon: '*icon*'
      })
      expect(parts).to.deep.equal([ '*icon*' ])
    })

    it('handles self-closing tags', function () {
      const parts = formatMessage.rich('Click <a><b />Here</a>!', {
        a: function (props) { return props },
        b: '/b/'
      })
      expect(parts).to.deep.equal([ 'Click ', { children: [ '/b/', 'Here' ] }, '!' ])
    })

    it('throws an error on mismatched tags', function () {
      const justEnd = '</e>'
      const justStart = '<s>'
      expect(function () { formatMessage.rich(justEnd) }).to.throw()
      expect(function () { formatMessage.rich(justStart) }).to.throw()
    })
  })

  describe('setup', function () {
    it('does nothing if you pass nothing', function () {
      expect(function () { formatMessage.setup() }).to.not.throw()
    })

    // uses runtimeOnly to avoid inlining since the tests are about runtime config
    it('changes the default locale', function () {
      const options = formatMessage.setup({ locale: 'ar' })
      const message = runtimeOnly('{n,plural,few{few}other{other}}', { n: 3 })
      expect(options.locale).to.equal('ar')
      expect(message).to.equal('few')
    })

    it('changes the translation', function () {
      formatMessage.setup({
        locale: 'en',
        translations: { en: {
          'trans-test': { message: 'test-success' },
          'trans-test2': 'test-success2'
        } },
        generateId: function (pattern) { return pattern }
      })
      const message = runtimeOnly('trans-test')
      const message2 = runtimeOnly('trans-test2')
      expect(message).to.equal('test-success')
      expect(message2).to.equal('test-success2')
    })

    it('changes the missing translation behavior', function () {
      const options = formatMessage.setup({
        locale: 'en',
        translations: { en: {} },
        missingTranslation: 'warning',
        missingReplacement: '!!!'
      })
      const warn = console.warn
      // capturing error message is fickle in node
      console.warn = function () {}

      const message = runtimeOnly({ id: 'test', default: 'translation-test' })
      console.warn = warn

      expect(options.missingTranslation).to.equal('warning')
      expect(options.missingReplacement).to.equal('!!!')
      expect(message).to.equal('!!!')
    })

    it('accepts a function for missingReplacement', function () {
      let args
      const options = formatMessage.setup({
        locale: 'en',
        translations: { en: {} },
        missingTranslation: 'ignore',
        missingReplacement: function (pattern, id, locale) {
          args = [ pattern, id, locale ]
          return 'func'
        }
      })

      const id = 'test-' + Date.now() // cache bust
      const message = runtimeOnly({ id: id, default: 'translation-test' })
      expect(args).to.deep.equal([ 'translation-test', id, 'en' ])
      expect(options.missingTranslation).to.equal('ignore')
      expect(options.missingReplacement).to.be.a('function')
      expect(message).to.equal('func')
    })

    it('falls back to pattern if missingReplacement returns nothing', function () {
      const options = formatMessage.setup({
        missingReplacement: function (pattern, id, locale) {}
      })

      const id = 'test-' + Date.now() // cache bust
      const message = runtimeOnly({ id: id, default: 'translation-test' })
      expect(options.missingReplacement).to.be.a('function')
      expect(message).to.equal('translation-test')
    })

    it('can throw on missing', function () {
      formatMessage.setup({
        translations: { en: {} },
        missingTranslation: 'error'
      })

      expect(function () { runtimeOnly('error-test') }).to.throw()
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
        } }
      } })
      let message = runtimeOnly('{ n, number, perc }', { n: 0.3672 })
      expect(message).to.match(/40\s*%/)
      message = runtimeOnly('{ d, date, day }', { d: new Date('2015/10/19') })
      expect(message).to.include('19')
      message = runtimeOnly('{ t, time, minute }', { t: new Date('2015/10/19 5:06') })
      expect(message).to.include('06')
    })

    it('adds custom types', function () {
      formatMessage.setup({
        formats: {}, // just for code coverage
        types: {
          locale: function (placeholder, locale) {
            return function (value, args) {
              return locale
            }
          }
        }
      })
      expect(formatMessage('{ a, locale }', {}, 'en-GB')).to.equal('en-GB')
    })
  })

  describe('number', function () {
    it('localizes a number', function () {
      expect(formatMessage.number(12345.67)).to.equal('12,345.67')
    })

    it('uses the style parameter', function () {
      expect(formatMessage.number(12.345, 'integer')).to.equal('12')
    })

    it('uses the locale parameter', function () {
      expect(formatMessage.number(12.345, '', 'en-u-nu-fullwide'))
        .to.equal('１２.３４５')
    })

    it('handles bad values gracefully', function () {
      expect(formatMessage.number(0)).to.equal('0')
      expect(formatMessage.number(-0)).to.equal('0')
      expect(formatMessage.number('')).to.equal('0')
      expect(formatMessage.number(false)).to.equal('0')
      expect(formatMessage.number(true)).to.equal('1')
      expect(formatMessage.number(NaN)).to.equal('NaN')
      expect(formatMessage.number(undefined)).to.equal('NaN')
      expect(formatMessage.number()).to.equal('NaN')
    })
  })

  describe('date', function () {
    it('localizes a date', function () {
      const result = formatMessage.date(new Date(2015, 11, 31))
      expect(result).to.include('2015')
    })

    it('uses the style parameter', function () {
      const result = formatMessage.date(new Date(2015, 11, 31), 'short')
      expect(result).to.include('12')
    })

    it('uses the locale parameter', function () {
      const result = formatMessage.date(new Date(2015, 11, 31), '', 'en-u-nu-fullwide')
      expect(result).to.include('３１')
    })

    it('handles bad values gracefully', function () {
      expect(formatMessage.date(0)).to.be.a('string')
      expect(formatMessage.date(-0)).to.be.a('string')
      expect(formatMessage.date('')).to.be.a('string')
      expect(formatMessage.date(false)).to.be.a('string')
      expect(formatMessage.date(true)).to.be.a('string')
      expect(formatMessage.date(undefined)).to.be.a('string')
      expect(formatMessage.date()).to.be.a('string')
    })
  })

  describe('time', function () {
    it('localizes a date', function () {
      const result = formatMessage.time(new Date(2015, 11, 31, 5, 16))
      expect(result).to.include('16')
    })

    it('uses the style parameter', function () {
      const result = formatMessage.time(new Date(2015, 11, 31, 5, 16), 'short')
      expect(result).to.include('16')
    })

    it('uses the locale parameter', function () {
      const result = formatMessage.time(new Date(2015, 11, 31, 5, 16), '', 'en-u-nu-fullwide')
      expect(result).to.include('１６')
    })

    it('handles bad values gracefully', function () {
      expect(formatMessage.time(0)).to.be.a('string')
      expect(formatMessage.time(-0)).to.be.a('string')
      expect(formatMessage.time('')).to.be.a('string')
      expect(formatMessage.time(false)).to.be.a('string')
      expect(formatMessage.time(true)).to.be.a('string')
      expect(formatMessage.time(undefined)).to.be.a('string')
      expect(formatMessage.time()).to.be.a('string')
    })
  })

  describe('select', function () {
    it('returns the matching value', function () {
      const result = formatMessage.select('match', { match: 'one', other: 'other' })
      expect(result).to.equal('one')
    })

    it('returns other when there is no match', function () {
      const result = formatMessage.select('bogus', { other: 1 })
      expect(result).to.equal(1)
    })
  })

  describe('plural', function () {
    it('returns the matching value', function () {
      const result = formatMessage.plural(1, { one: 'one1' })
      expect(result).to.equal('one1')
    })

    it('considers offset for keyword matches', function () {
      const result = formatMessage.plural(2, 1, { one: 'one2' })
      expect(result).to.equal('one2')
    })

    it('ignores offset for exact matches', function () {
      const result = formatMessage.plural(2, 1, { '=2': 'two2' })
      expect(result).to.equal('two2')
    })

    it('considers locale for keyword matches', function () {
      const result = formatMessage.plural(2, { two: 2 }, 'ar')
      expect(result).to.equal(2)
    })

    it('returns other when there is no match', function () {
      const result = formatMessage.plural(3, { other: 1 })
      expect(result).to.equal(1)
    })

    it('always returns other for unknown locale', function () {
      const result = formatMessage.plural(3, { other: 1 }, 'tlh')
      expect(result).to.equal(1)
    })
  })

  describe('selectordinal', function () {
    it('returns the matching value', function () {
      const result = formatMessage.selectordinal(3, { few: 'one1' })
      expect(result).to.equal('one1')
    })

    it('considers offset for keyword matches', function () {
      const result = formatMessage.selectordinal(3, 1, { two: 'one2' })
      expect(result).to.equal('one2')
    })

    it('ignores offset for exact matches', function () {
      const result = formatMessage.selectordinal(2, 1, { '=2': 'two2' })
      expect(result).to.equal('two2')
    })

    it('considers locale for keyword matches', function () {
      let result = formatMessage.selectordinal(1, { one: 2 }, 'hy')
      expect(result).to.equal(2)
      result = formatMessage.selectordinal(2, { two: 1, other: 'o' }, 'en')
      expect(result).to.equal(1)
      result = formatMessage.selectordinal(2, { two: 1, other: 'o' }, 'hy')
      expect(result).to.equal('o')
    })

    it('returns other when there is no match', function () {
      const result = formatMessage.selectordinal(3, { other: 1 })
      expect(result).to.equal(1)
    })
  })

  describe('namespace', function () {
    let ns, options

    beforeEach(function () {
      ns = formatMessage.namespace()
      options = ns.setup({
        locale: 'fr',
        translations: {
          fr: {
            foo: 'bar'
          }
        }
      })
    })

    it('setup does not change other namespaces', function () {
      const globalOptions = formatMessage.setup()
      expect(options.transations).not.to.equal(globalOptions.translations)
    })

    it('uses its own configuration', function () {
      expect(ns('foo')).to.equal('bar')
    })
  })
})
