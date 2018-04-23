/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const print = require('..')

describe('print()', function () {
  it('normalizes escaping', function () {
    const pattern = print([
      'can\'t escape {}',
      [ 's', 'date', 'MM dd yy' ],
      [ 't', 't', '\'' ],
      [ 'p', 'plural', 1, {
        other: [ '#', [ '#' ] ]
      } ]
    ])
    expect(pattern).to.equal(
      'can\'\'t escape \'{}\'{ s, date, \'MM dd yy\' }{ t, t, \'\' }' +
      '{ p, plural, offset:1\n' +
      '  other {\'#\'#}\n' +
      '}'
    )
  })

  it('consistently escapes style', function () {
    // regress stateful regex bug
    const pattern = print([
      [ 'a', 'b', 'c d' ],
      [ 'a', 'b', 'c d' ]
    ])
    expect(pattern).to.equal('{ a, b, \'c d\' }{ a, b, \'c d\' }')
  })

  it('pretty formats plurals', function () {
    const pattern = print([
      [ 'bananas', 'plural', 0, {
        '=0': [ 'no bananas' ],
        one: [ [ '#' ], ' banana' ],
        other: [ [ '#' ], ' bananas' ]
      } ]
    ])
    expect(pattern).to.equal(
      '{ bananas, plural,\n' +
      '     =0 {no bananas}\n' +
      '    one {# banana}\n' +
      '  other {# bananas}\n' +
      '}'
    )
  })

  it('pretty prints selectordinal', function () {
    const pattern = print([
      [ 'place', 'selectordinal', 0, {
        one: [ [ '#' ], 'st place' ],
        two: [ [ '#' ], 'nd place' ],
        few: [ [ '#' ], 'rd place' ],
        other: [ [ '#' ], 'th place' ]
      } ]
    ])
    expect(pattern).to.equal(
      '{ place, selectordinal,\n' +
      '    one {#st place}\n' +
      '    two {#nd place}\n' +
      '    few {#rd place}\n' +
      '  other {#th place}\n' +
      '}'
    )
  })

  it('pretty prints select', function () {
    const pattern = print([
      [ 'gender', 'select', {
        male: [ 'invite him' ],
        female: [ 'invite her' ],
        other: [ 'invite them' ]
      } ]
    ])
    expect(pattern).to.equal(
      '{ gender, select,\n' +
      '    male {invite him}\n' +
      '  female {invite her}\n' +
      '   other {invite them}\n' +
      '}'
    )
  })

  it('pretty prints other placeholders', function () {
    expect(print([[ 'a', 'b', 'c' ]])).to.equal('{ a, b, c }')
    expect(print([[ 'a', 'b' ]])).to.equal('{ a, b }')
    expect(print([[ 'a' ]])).to.equal('{ a }')
  })
})
