/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var interpret = require('..')
var toParts = interpret.toParts

describe('interpret()', function () {
  var PluralRules = Intl.PluralRules
  afterEach(function () {
    Intl.PluralRules = PluralRules
  })

  it('interprets simple strings', function () {
    var format = interpret(['just some text'])
    expect(format()).to.equal('just some text')
  })

  it('interprets simple placeholders', function () {
    var format = interpret(['Welcome to ', ['place'], '!'])
    expect(format({ place: 'nowhere' })).to.equal('Welcome to nowhere!')
  })

  it('handles missing arguments', function () {
    var format = interpret([['a']])
    expect(format()).to.equal('undefined')
    expect(format({})).to.equal('undefined')
    expect(format({ a: null })).to.equal('null')
    expect(format({ a: undefined })).to.equal('undefined')
  })

  it('handles dotted ids', function () {
    var format = interpret([['a.b'], ['a.b.c']])
    expect(format({ a: { b: '1' }, 'a.b.c': '2' })).to.equal('12')
    expect(format()).to.equal('undefinedundefined')
    expect(format({})).to.equal('undefinedundefined')
    expect(format({ a: { b: null } })).to.equal('nullnull')
  })

  it('coerces arguments to strings', function () {
    var format = interpret([['a']])
    expect(format({ a: 12 })).to.equal('12')
  })

  it('interprets number placeholders', function () {
    var format = interpret([['n', 'number']], 'en')
    expect(format({ n: 1234.56 })).to.equal('1,234.56')
    format = interpret([['n', 'number', 'integer']], 'en')
    expect(format({ n: 1234.56 })).to.equal('1,235')
  })

  it('interprets bad number values gracefully', function () {
    var format = interpret([['n', 'number']], 'en')
    expect(format({ n: 0 })).to.equal('0')
    expect(format({ n: -0 })).to.equal('0')
    expect(format({ n: '' })).to.equal('0')
    expect(format({ n: false })).to.equal('0')
    expect(format({ n: true })).to.equal('1')
    expect(format({ n: null })).to.equal('0')
    expect(format({ n: NaN })).to.equal('NaN')
    expect(format({ n: undefined })).to.equal('NaN')
    expect(format({})).to.equal('NaN')
  })

  it('interprets number pattern placeholders', function () {
    var format = interpret([['n', 'number', '0 ¤¤ EUR']], 'en')
    expect(format({ n: 1234.5 })).to.match(/EUR\s*1235/)
  })

  it('interprets ordinal placeholders (as plain numbers)', function () {
    var format = interpret([['n', 'ordinal']], 'en')
    expect(format({ n: 1234.56 })).to.equal('1,234.56')
  })

  it('interprets spellout placeholders (as plain numbers)', function () {
    var format = interpret([['n', 'spellout']], 'en')
    expect(format({ n: 1234.56 })).to.equal('1,234.56')
  })

  it('interprets duration placeholders', function () {
    var format = interpret([['d', 'duration']], 'en')
    expect(format({ d: -123456789 })).to.equal('-34,293:33:09')
    expect(format({ d: 12345.6789 })).to.equal('3:25:45.679')
    expect(format({ d: 12.3456 })).to.equal('00:12.346')
    expect(format({ d: -12.3456 })).to.equal('-00:12.346')
    expect(format({ d: -60 })).to.equal('-01:00')
    expect(format({ d: -0 })).to.equal('00:00')
    expect(format({ d: 60 * 60 })).to.equal('1:00:00')
    expect(format({ d: Infinity })).to.be.oneOf(['∞', 'Infinity'])

    var formatDa = interpret([['d', 'duration']], 'da')
    expect(formatDa({ d: 60 * 60 })).to.equal('1.00.00')

    var formatFi = interpret([['d', 'duration']], 'fi')
    expect(formatFi({ d: 60 * 60 })).to.equal('1.00.00')

    var formatFil = interpret([['d', 'duration']], 'fil')
    expect(formatFil({ d: 60 * 60 })).to.equal('1:00:00')
  })

  if (Intl.NumberFormat.supportedLocalesOf('ar')[0] === 'ar') {
    it('puts the duration sign on the correct side of the number', function () {
      var format = interpret([['d', 'duration']], 'ar')
      expect(format({ d: -12.3456 })).to.equal('؜-٠٠:١٢٫٣٤٦')
    })
  }

  it('interprets date placeholders', function () {
    var format = interpret([['d', 'date']], 'en')
    expect(format({ d: new Date(0) })).to.match(/1/)
    format = interpret([['d', 'date', 'full']], 'en')
    expect(format({ d: new Date(0) })).to.match(/Jan|Dec/)
  })

  it('interprets bad date values gracefully', function () {
    var format = interpret([['d', 'date']], 'en')
    expect(format({ d: 0 })).to.be.a('string')
    expect(format({ d: -0 })).to.be.a('string')
    expect(format({ d: '' })).to.be.a('string')
    expect(format({ d: false })).to.be.a('string')
    expect(format({ d: true })).to.be.a('string')
    expect(format({ d: null })).to.be.a('string')
    expect(format({ d: undefined })).to.be.a('string')
    expect(format({})).to.be.a('string')
  })

  it('interprets time placeholders', function () {
    var format = interpret([['d', 'time']])
    expect(format({ d: new Date(0) })).to.contain('00')
    format = interpret([['d', 'time', 'full']])
    expect(format({ d: new Date(0) })).to.contain('00')
  })

  it('interprets bad time values gracefully', function () {
    var format = interpret([['d', 'time']], 'en')
    expect(format({ d: 0 })).to.be.a('string')
    expect(format({ d: -0 })).to.be.a('string')
    expect(format({ d: '' })).to.be.a('string')
    expect(format({ d: false })).to.be.a('string')
    expect(format({ d: true })).to.be.a('string')
    expect(format({ d: null })).to.be.a('string')
    expect(format({ d: undefined })).to.be.a('string')
    expect(format({})).to.be.a('string')
  })

  it('interprets date pattern placeholders', function () {
    var format = interpret([['n', 'time', 'yyyy']], 'en')
    expect(format({ n: new Date(2000, 6, 6) })).to.contain('2000')
  })

  it('interprets select placeholders', function () {
    var format = interpret([['s', 'select', {
      a: ['a'],
      other: ['b']
    }]])
    expect(format({ s: 'b' })).to.equal('b')
  })

  it('interprets plural placeholders', function () {
    var format = interpret([['p', 'plural', 0, {
      one: ['one'],
      other: ['other']
    }]])
    expect(format({ p: 1 })).to.equal('one')
    expect(format({ p: 2 })).to.equal('other')
  })

  it('interprets selectordinal placeholders', function () {
    var format = interpret([['p', 'selectordinal', 0, {
      one: ['one'],
      few: [['#'], 'rd'],
      other: ['other']
    }]])
    expect(format({ p: 3 })).to.equal('3rd')
    expect(format({ p: 2 })).to.equal('other')
  })

  it('uses Intl.PluralRules if available', function () {
    Intl.PluralRules = function () {}
    Intl.PluralRules.supportedLocalesOf = function (locales) {
      return [].concat(locales || [])
    }
    Intl.PluralRules.prototype = {
      select: function () { return 'one' }
    }
    var format = interpret([['p', 'plural', 0, {
      one: ['one'],
      other: ['other']
    }]])
    expect(format({ p: 200 })).to.equal('one')
  })

  it('ignores Intl.PluralRules if it does not support the locale', function () {
    Intl.PluralRules = function () {}
    Intl.PluralRules.supportedLocalesOf = function (locales) {
      return []
    }
    Intl.PluralRules.prototype = {
      select: function () { return 'one' }
    }
    var format = interpret([['p', 'plural', 0, {
      one: ['one'],
      other: ['other']
    }]], 'pt')
    expect(format({ p: 200 })).to.equal('other')
  })

  it('defaults to other if no plural rules', function () {
    var format = interpret([['p', 'selectordinal', 0, {
      one: ['one'],
      other: ['other']
    }]], 'ar')
    expect(format({ p: 1 })).to.equal('other')
  })

  it('interprets unknown placeholders as simple strings', function () {
    var format = interpret([['a', 'b', 'c']])
    expect(format({ a: 1 })).to.equal('1')
  })

  it('interprets simple custom placeholders', function () {
    var format = interpret([['a', 'b', 'c']], 'en', {
      b: function (element, locale) {
        return function (value, args) {
          return JSON.stringify([locale, element, value, args])
        }
      }
    })
    expect(format({ a: 1 })).to.equal('["en",["a","b","c"],1,{"a":1}]')
  })

  it('interprets custom placeholders with sub-messages', function () {
    var format = interpret([['a', 'sub', {
      s: ['m']
    }]], 'en', {
      sub: function (element, locale) {
        return function (value, args) {
          return JSON.stringify([locale, element, value, args]) + element[2].s(args)
        }
      }
    })
    expect(format({ a: 1 })).to.equal('["en",["a","sub",{}],1,{"a":1}]m')
  })
})

describe('interpret.toParts()', function () {
  it('does not coerce arguments to strings', function () {
    var format = toParts([['a']])
    expect(format({ a: 1 })).to.deep.equal([1])
    expect(format({})).to.deep.equal([undefined])
    expect(format()).to.deep.equal([undefined])
  })

  it('can be used to create rich messages', function () {
    var format = toParts(['click ', ['a', 'jsx', {
      children: ['here']
    }]], 'en', {
      jsx: function (node, locales) {
        return function (fn, args) {
          return fn(node[2].children(args))
        }
      }
    })
    expect(format({
      a: function (children) {
        return { type: 'a', props: { children: children } }
      }
    })).to.deep.equal([
      'click ',
      { type: 'a', props: { children: ['here'] } }
    ])
  })
})
