/* eslint-env mocha */
// include polyfll for Safari and PhantomJS
if (typeof Intl === 'undefined') {
  require('intl')
  require('intl/locale-data/jsonp/en')
}
var expect = require('chai').expect
var MessageFormat = require('../packages/message-format')
var plurals = require('../packages/format-message-interpret/plurals')

describe('MessageFormat', function () {
  describe('constructor', function () {
    it('can be called without `new`', function () {
      var message = MessageFormat('en', 'no new')
      expect(message.constructor).to.equal(MessageFormat)
      expect(message instanceof MessageFormat).to.equal(true)
      expect(message.format).to.exist
    })

    it('should resolve passed locale to closest supported locale', function () {
      var message = new MessageFormat('pt-PT', 'ola')
      expect(message.resolvedOptions().locale).to.equal('pt-PT')
      message = new MessageFormat('pt-BR', 'oi')
      expect(message.resolvedOptions().locale).to.equal('pt')
    })

    it('should throw an error with bad syntax', function () {
      expect(function () { return new MessageFormat('en', {}) }).to.throw()
      expect(function () { return new MessageFormat('en', 'no finish arg {') }).to.throw()
      expect(function () { return new MessageFormat('en', 'no start arg }') }).to.throw()
      expect(function () { return new MessageFormat('en', 'empty arg {}') }).to.throw()
      expect(function () { return new MessageFormat('en', 'unfinished select { a, select }') }).to.throw()
      expect(function () { return new MessageFormat('en', 'unfinished select { a, select, }') }).to.throw()
      expect(function () { return new MessageFormat('en', 'sub with no selector { a, select, {hi} }') }).to.throw()
      expect(function () { return new MessageFormat('en', 'sub with no other { a, select, foo {hi} }') }).to.throw()
      expect(function () { return new MessageFormat('en', 'wrong escape \\{') }).to.throw()
      expect(function () { return new MessageFormat('en', 'bad arg type { a, bogus, nope }') }).to.throw()
      expect(function () { return new MessageFormat('en', 'bad arg separator { a bogus, nope }') }).to.throw()
    })
  })

  describe('format', function () {
    it('formats a simple message', function () {
      var pattern = 'Simple string with nothing special'
      var message = new MessageFormat('en', pattern).format()

      expect(message).to.equal('Simple string with nothing special')
    })

    it('handles pattern with escaped text', function () {
      var pattern = 'This isn\'\'t a \'{\'\'simple\'\'}\' \'string\''
      var message = new MessageFormat('en', pattern).format()

      expect(message).to.equal('This isn\'t a {\'simple\'} \'string\'')
    })

    it('accepts arguments', function () {
      var pattern = 'x{ arg }z'
      var message = new MessageFormat('en', pattern).format({ arg: 'y' })

      expect(message).to.equal('xyz')
    })

    it('formats numbers, dates, and times', function () {
      var pattern = '{ n, number } : { d, date, short } { d, time, short }'
      var message = new MessageFormat('en', pattern).format({ n: 0, d: new Date(0) })

      expect(message).to.match(/^0 \: \d\d?\/\d\d?\/\d{2,4} \d\d?\:\d\d [AP]M$/)
    })

    it('handles plurals', function () {
      var pattern =
        'On {takenDate, date, short} {name} {numPeople, plural, offset:1' +
        '    =0 {didn\'t carpool.}' +
        '    =1 {drove himself.}' +
        ' other {drove # people.}}'
      var message = new MessageFormat('en', pattern)
          .format({ takenDate: new Date(), name: 'Bob', numPeople: 5 })

      expect(message).to.match(/^On \d\d?\/\d\d?\/\d{2,4} Bob drove 4 people.$/)
    })

    it('handles plurals for other locales', function () {
      var pattern =
        '{n, plural,' +
        '  zero {zero}' +
        '   one {one}' +
        '   two {two}' +
        '   few {few}' +
        '  many {many}' +
        ' other {other}}'
      var message = new MessageFormat('ar', pattern)

      expect(message.resolvedOptions().locale).to.equal('ar')
      expect(message.format({ n: 0 })).to.equal('zero')
      expect(message.format({ n: 1 })).to.equal('one')
      expect(message.format({ n: 2 })).to.equal('two')
      expect(message.format({ n: 3 })).to.equal('few')
      expect(message.format({ n: 11 })).to.equal('many')
    })

    it('handles selectordinals', function () {
      var pattern =
        '{n, selectordinal,' +
        '   one {#st}' +
        '   two {#nd}' +
        '   few {#rd}' +
        ' other {#th}}'
      var message = new MessageFormat('en', pattern)

      expect(message.format({ n: 1 })).to.equal('1st')
      expect(message.format({ n: 22 })).to.equal('22nd')
      expect(message.format({ n: 103 })).to.equal('103rd')
      expect(message.format({ n: 4 })).to.equal('4th')
    })

    it('handles select', function () {
      var pattern =
        '{ gender, select,' +
        '   male {it\'s his turn}' +
        ' female {it\'s her turn}' +
        '  other {it\'s their turn}}'
      var message = new MessageFormat('en', pattern)
          .format({ gender: 'female' })

      expect(message).to.equal('it\'s her turn')
    })

    it('should throw an error when args are expected and not passed', function () {
      expect(function () { return new MessageFormat('en', '{a}').format() }).to.throw()
    })
  })

  describe('locales', function () {
    it('doesn\'t throw for any locale\'s plural function', function () {
      var pattern =
        '{n, plural,' +
        '  zero {zero}' +
        '   one {one}' +
        '   two {two}' +
        '   few {few}' +
        '  many {many}' +
        ' other {other}}'
      Object.keys(plurals).forEach(function (locale) {
        var message = new MessageFormat(locale, pattern)
        expect(message.resolvedOptions().locale).to.equal(locale)
        for (var n = 0; n <= 200; ++n) {
          var result = message.format({ n: n })
          expect(result).to.match(/^(zero|one|two|few|many|other)$/)
        }
      })
    })
  })
})
