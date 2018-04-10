/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const interpret = require('..')
const toParts = interpret.toParts

describe('interpret()', function () {
  const PluralRules = Intl.PluralRules
  afterEach(function () {
    Intl.PluralRules = PluralRules
  })

  it('interprets simple strings', function () {
    const format = interpret('en', [ 'just some text' ])
    expect(format()).to.equal('just some text')
  })

  it('interprets simple placeholders', function () {
    const format = interpret('en', [ 'Welcome to ', ['place'], '!' ])
    expect(format({ place: 'nowhere' })).to.equal('Welcome to nowhere!')
  })

  it('handles missing arguments', function () {
    const format = interpret('en', [[ 'a' ]])
    expect(format()).to.equal('undefined')
    expect(format({})).to.equal('undefined')
    expect(format({ a: null })).to.equal('null')
    expect(format({ a: undefined })).to.equal('undefined')
  })

  it('handles dotted ids', function () {
    const format = interpret('en', [['a.b'], ['a.b.c']])
    expect(format({ a: { b: '1' }, 'a.b.c': '2' })).to.equal('12')
    expect(format()).to.equal('undefinedundefined')
    expect(format({})).to.equal('undefinedundefined')
    expect(format({ a: { b: null } })).to.equal('nullnull')
  })

  it('coerces arguments to strings', function () {
    const format = interpret('en', [['a']])
    expect(format({ a: 12 })).to.equal('12')
  })

  it('interprets number placeholders', function () {
    let format = interpret('en', [[ 'n', 'number' ]])
    expect(format({ n: 1234.56 })).to.equal('1,234.56')
    format = interpret('en', [[ 'n', 'number', 'integer' ]])
    expect(format({ n: 1234.56 })).to.equal('1,235')
  })

  it('interprets ordinal placeholders (as plain numbers)', function () {
    const format = interpret('en', [[ 'n', 'ordinal' ]])
    expect(format({ n: 1234.56 })).to.equal('1,234.56')
  })

  it('interprets spellout placeholders (as plain numbers)', function () {
    const format = interpret('en', [[ 'n', 'spellout' ]])
    expect(format({ n: 1234.56 })).to.equal('1,234.56')
  })

  it('interprets duration placeholders', function () {
    const format = interpret('en', [ [ 'd', 'duration' ] ])
    expect(format({ d: -123456789 })).to.equal('-34,293:33:09')
    expect(format({ d: 12345.6789 })).to.equal('3:25:45.679')
    expect(format({ d: 12.3456 })).to.equal('00:12.346')
    expect(format({ d: -12.3456 })).to.equal('-00:12.346')
    expect(format({ d: -60 })).to.equal('-01:00')
    expect(format({ d: -0 })).to.equal('00:00')
    expect(format({ d: 60 * 60 })).to.equal('1:00:00')
    expect(format({ d: Infinity })).to.equal('∞')

    const formatDa = interpret('da', [ [ 'd', 'duration' ] ])
    expect(formatDa({ d: 60 * 60 })).to.equal('1.00.00')

    const formatFi = interpret('fi', [ [ 'd', 'duration' ] ])
    expect(formatFi({ d: 60 * 60 })).to.equal('1.00.00')

    const formatFil = interpret('fil', [ [ 'd', 'duration' ] ])
    expect(formatFil({ d: 60 * 60 })).to.equal('1:00:00')
  })

  it('interprets date placeholders', function () {
    let format = interpret('en', [[ 'd', 'date' ]])
    expect(format({ d: new Date(0) })).to.match(/1/)
    format = interpret('en', [[ 'd', 'date', 'full' ]])
    expect(format({ d: new Date(0) })).to.match(/Jan|Dec/)
  })

  it('interprets time placeholders', function () {
    let format = interpret('en', [[ 'd', 'time' ]])
    expect(format({ d: new Date(0) })).to.match(/:00/)
    format = interpret('en', [[ 'd', 'time', 'full' ]])
    expect(format({ d: new Date(0) })).to.match(/:00/)
  })

  it('interprets select placeholders', function () {
    const format = interpret('en', [[ 's', 'select', {
      a: [ 'a' ],
      other: [ 'b' ]
    } ]])
    expect(format({ s: 'b' })).to.equal('b')
  })

  it('interprets plural placeholders', function () {
    const format = interpret('en', [[ 'p', 'plural', 0, {
      one: [ 'one' ],
      other: [ 'other' ]
    } ]])
    expect(format({ p: 1 })).to.equal('one')
    expect(format({ p: 2 })).to.equal('other')
  })

  it('interprets selectordinal placeholders', function () {
    const format = interpret('en', [[ 'p', 'selectordinal', 0, {
      one: [ 'one' ],
      few: [ [ '#' ], 'rd' ],
      other: [ 'other' ]
    } ]])
    expect(format({ p: 3 })).to.equal('3rd')
    expect(format({ p: 2 })).to.equal('other')
  })

  it('uses Intl.PluralRules if available', function () {
    Intl.PluralRules = function () {}
    Intl.PluralRules.prototype = {
      select: function () { return 'one' }
    }
    const format = interpret('en', [[ 'p', 'plural', 0, {
      one: [ 'one' ],
      other: [ 'other' ]
    } ]])
    expect(format({ p: 200 })).to.equal('one')
  })

  it('defaults to other if no plural rules', function () {
    const format = interpret('ar', [[ 'p', 'selectordinal', 0, {
      one: [ 'one' ],
      other: [ 'other' ]
    } ]])
    expect(format({ p: 1 })).to.equal('other')
  })

  it('interprets unknown placeholders as simple strings', function () {
    const format = interpret('en', [['a', 'b', 'c']])
    expect(format({ a: 1 })).to.equal('1')
  })

  it('interprets simple custom placeholders', function () {
    const format = interpret('en', [['a', 'b', 'c']], {
      b: function (locale, element) {
        return function (value, args) {
          return JSON.stringify([ locale, element, value, args ])
        }
      }
    })
    expect(format({ a: 1 })).to.equal('["en",["a","b","c"],1,{"a":1}]')
  })

  it('interprets custom placeholders with sub-messages', function () {
    const format = interpret('en', [['a', 'sub', {
      s: [ 'm' ]
    }]], {
      sub: function (locale, element) {
        return function (value, args) {
          return JSON.stringify([ locale, element, value, args ]) + element[2].s(args)
        }
      }
    })
    expect(format({ a: 1 })).to.equal('["en",["a","sub",{}],1,{"a":1}]m')
  })
})

describe('interpret.toParts()', function () {
  it('does not coerce arguments to strings', function () {
    const format = toParts('en', [[ 'a' ]])
    expect(format({ a: 1 })).to.deep.equal([ 1 ])
    expect(format({})).to.deep.equal([ undefined ])
    expect(format()).to.deep.equal([ undefined ])
  })

  it('can be used to create rich messages', function () {
    const format = toParts('en', [ 'click ', [ 'a', 'jsx', {
      children: [ 'here' ]
    } ]], {
      jsx: function (locales, node) {
        return function (fn, args) {
          return fn(node[2].children(args))
        }
      }
    })
    expect(format({ a: function (children) {
      return { type: 'a', props: { children: children } }
    } })).to.deep.equal([
      'click ',
      { type: 'a', props: { children: [ 'here' ] } }
    ])
  })
})
