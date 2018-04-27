/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
var expect = require('chai').expect
var MessageFormat = require('..')

describe('MessageFormat', function () {
  describe('constructor', function () {
    it('cannot be called without `new`', function () {
      expect(function () { MessageFormat('no new', 'en') }).to.throw(
        TypeError,
        'calling MessageFormat constructor without new is invalid'
      )
      var message = new MessageFormat('')
      expect(function () { MessageFormat.call(message, '', 'en') }).to.throw(
        TypeError,
        'calling MessageFormat constructor without new is invalid'
      )
    })

    it('should throw an error with bad syntax', function () {
      expect(function () { return new MessageFormat('no finish arg {') }).to.throw()
      expect(function () { return new MessageFormat('no start arg }') }).to.throw()
      expect(function () { return new MessageFormat('empty arg {}') }).to.throw()
      expect(function () { return new MessageFormat('unfinished select { a, select }') }).to.throw()
      expect(function () { return new MessageFormat('unfinished select { a, select, }') }).to.throw()
      expect(function () { return new MessageFormat('sub with no selector { a, select, {hi} }') }).to.throw()
      expect(function () { return new MessageFormat('sub with no other { a, select, foo {hi} }') }).to.throw()
      expect(function () { return new MessageFormat('wrong escape \\{') }).to.throw()
      expect(function () { return new MessageFormat('bad arg separator { a bogus, nope }') }).to.throw()
    })
  })

  describe('prototype', function () {
    (typeof Symbol === 'undefined' ? xit : it)('toStringTag', function () {
      var descr = Object.getOwnPropertyDescriptor(MessageFormat.prototype, Symbol.toStringTag)
      expect(descr.writable).to.equal(false)
      expect(descr.enumerable).to.equal(false)
      expect(descr.configurable).to.equal(false)
      expect(descr.value).to.equal('Object')
    })

    it('has a format getter', function () {
      var descr = Object.getOwnPropertyDescriptor(MessageFormat.prototype, 'format')
      expect(descr.enumerable).to.equal(false)
      expect(descr.configurable).to.equal(true)
      expect(descr.get).to.exist
      expect(descr.set).to.not.exist
    })

    it('has a resolvedOptions value', function () {
      var descr = Object.getOwnPropertyDescriptor(MessageFormat.prototype, 'resolvedOptions')
      expect(descr.enumerable).to.equal(false)
      expect(descr.configurable).to.equal(true)
      expect(descr.writable).to.equal(true)
      expect(descr.value).to.exist
    })
  })

  describe('supportedLocalesOf', function () {
    it('returns empty when called with nothing', function () {
      expect(MessageFormat.supportedLocalesOf()).to.eql([])
    })

    it('accepts a single string', function () {
      expect(MessageFormat.supportedLocalesOf('en')).to.eql([ 'en' ])
    })

    it('accepts an array', function () {
      expect(MessageFormat.supportedLocalesOf([ 'en' ])).to.eql([ 'en' ])
    })

    it('removes duplicates', function () {
      expect(MessageFormat.supportedLocalesOf([ 'en', 'en' ])).to.eql([ 'en' ])
    })

    it('removes unsupported locales', function () {
      expect(MessageFormat.supportedLocalesOf([ 'en', 'tlh' ])).to.eql([ 'en' ])
    })

    it('supports multiple locales', function () {
      expect(MessageFormat.supportedLocalesOf([ 'en', 'es', 'de', 'ar' ])).to.eql([ 'en', 'es', 'de', 'ar' ])
    })

    it('ignores and preserves extensions', function () {
      expect(MessageFormat.supportedLocalesOf('en-US-u-nu-latn')).to.eql([ 'en-US-u-nu-latn' ])
    })
  })

  describe('resolvedOptions', function () {
    it('throws if you call it without a set up MessageFormat', function () {
      expect(function () { new MessageFormat('').resolvedOptions.call() }).to.throw(
        TypeError,
        'MessageFormat.prototype.resolvedOptions called on value that\'s not an object initialized as a MessageFormat'
      )
    })

    it('should resolve passed locale to closest supported locale', function () {
      var message = new MessageFormat('ola', 'pt-PT')
      expect(message.resolvedOptions().locale).to.equal('pt-PT')
      message = new MessageFormat('oi', 'pt-BR')
      expect(message.resolvedOptions().locale).to.equal('pt-BR')
    })
  })

  describe('format', function () {
    it('throws if you try to get it without a set up MessageFormat', function () {
      expect(function () { MessageFormat.prototype.format }).to.throw(
        TypeError,
        'MessageFormat.prototype.format called on value that\'s not an object initialized as a MessageFormat'
      )
    })

    it('formats a simple message', function () {
      var pattern = 'Simple string with nothing special'
      var message = new MessageFormat(pattern).format()
      expect(message).to.equal('Simple string with nothing special')
    })

    it('handles pattern with escaped text', function () {
      var pattern = 'This isn\'\'t a \'{\'\'simple\'\'}\' \'string\''
      var message = new MessageFormat(pattern).format()
      expect(message).to.equal('This isn\'t a {\'simple\'} \'string\'')
    })

    it('accepts arguments', function () {
      var pattern = 'x{ arg }z'
      var message = new MessageFormat(pattern).format({ arg: 'y' })
      expect(message).to.equal('xyz')
    })

    it('accepts arguments with periods', function () {
      var pattern = 'x{ arg.y }z'
      var message = new MessageFormat(pattern).format({ 'arg.y': 'y' })
      expect(message).to.equal('xyz')
    })

    it('accepts arguments as a nested data object', function () {
      var pattern = 'x{ arg.y }z'
      var message = new MessageFormat(pattern).format({ arg: { y: 'y' } })
      expect(message).to.equal('xyz')
    })

    it('will prioritize arguments with periods over nested data object', function () {
      var pattern = 'x{ arg.y }z'
      var message = new MessageFormat(pattern).format({ 'arg.y': 'y', arg: { y: 'a' } })
      expect(message).to.equal('xyz')
    })

    it('formats numbers, dates, and times', function () {
      var pattern = '{ n, number } : { d, date, full } { d, time, short }'
      var localeEpoch = new Date(new Date(0).getTimezoneOffset() * 60 * 1000)
      var message = new MessageFormat(pattern, 'en').format({ n: 1000, d: localeEpoch })
      expect(message).to.include('1,000')
      expect(message).to.include('Jan')
      expect(message).to.include('12')
    })

    it('handles plurals', function () {
      var pattern =
        '{name} {numPeople, plural, offset:1' +
        '    =0 {didn\'t carpool.}' +
        '    =1 {drove himself.}' +
        ' other {drove # people.}}'
      var message = new MessageFormat(pattern, 'en')
        .format({ name: 'Bob', numPeople: 5 })
      expect(message).to.equal('Bob drove 4 people.')
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
      var message = new MessageFormat(pattern, 'ar')
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
      var message = new MessageFormat(pattern)
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
      var message = new MessageFormat(pattern)
        .format({ gender: 'female' })
      expect(message).to.equal('it\'s her turn')
    })

    it('handles custom placeholder types', function () {
      var message = new MessageFormat('{ a, locale }', 'en-GB', {
        types: {
          locale: function (placeholder, locale) {
            return function (value, args) {
              return locale
            }
          }
        }
      })
      expect(message.format({ a: 1 })).to.equal('en-GB')
    })

    it('should not throw an error when args are expected and not passed', function () {
      expect(function () { return new MessageFormat('{a}').format() }).to.not.throw()
    })
  })

  describe('formatToParts', function () {
    it('throws if you call it without a set up MessageFormat', function () {
      expect(function () { new MessageFormat('').formatToParts.call() }).to.throw(
        TypeError,
        'MessageFormat.prototype.formatToParts called on value that\'s not an object initialized as a MessageFormat'
      )
    })

    it('returns an array of message parts', function () {
      expect(new MessageFormat('hi').formatToParts()).to.eql([ 'hi' ])
      expect(new MessageFormat('{n}').formatToParts({ n: 1 })).to.eql([ 1 ])
    })

    it('handles custom placeholder types', function () {
      var message = new MessageFormat('{a,b,c}', 'en', {
        types: {
          b: function (placeholder, locale) {
            return function (value, args) {
              return placeholder.join('-')
            }
          }
        }
      })
      expect(message.formatToParts()).to.eql([ 'a-b-c' ])
      expect(message.formatToParts({ a: 1 })).to.eql([ 'a-b-c' ])
    })
  })
})
