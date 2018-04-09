/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const parse = require('..')

describe('parse()', function () {
  it('coerces pattern to a string', function () {
    expect(parse()).to.deep.equal([ 'undefined' ])
    expect(parse(null)).to.deep.equal([ 'null' ])
    expect(parse(12.34)).to.deep.equal([ '12.34' ])
    expect(parse({ toString: function () { return '' } })).to.deep.equal([])
  })

  it('can parse("Hello, World!")', function () {
    const tokens = []
    const msg = 'Hello, World!'
    expect(parse(msg, tokens)).to.deep.equal([ msg ])
    expect(tokens).to.deep.equal([ [ 'text', msg ] ])
  })

  it('can parse("Hello, {name}!")', function () {
    const tokens = []
    expect(parse('Hello, {name}!', tokens)).to.deep.equal([
      'Hello, ',
      [ 'name' ],
      '!'
    ])
    expect(tokens).to.deep.equal([
      [ 'text', 'Hello, ' ],
      [ '{', '{' ],
      [ 'id', 'name' ],
      [ '}', '}' ],
      [ 'text', '!' ]
    ])
  })

  it('can parse("{num, number, percent }")', function () {
    const tokens = []
    expect(parse('{num, number, percent }', tokens)).to.deep.equal([
      [ 'num', 'number', 'percent' ]
    ])
    expect(tokens).to.deep.equal([
      [ '{', '{' ],
      [ 'id', 'num' ],
      [ ',', ',' ],
      [ 'space', ' ' ],
      [ 'type', 'number' ],
      [ ',', ',' ],
      [ 'space', ' ' ],
      [ 'style', 'percent' ],
      [ 'space', ' ' ],
      [ '}', '}' ]
    ])
  })

  it('can parse("{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}")', function () {
    const tokens = []
    const msg = '{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}'
    expect(parse(msg, tokens)).to.deep.equal([
      [ 'numPhotos', 'plural', 0, {
        '=0': [ 'no photos' ],
        '=1': [ 'one photo' ],
        'other': [ [ '#' ], ' photos' ]
      } ]
    ])
    expect(tokens).to.deep.equal([
      [ '{', '{' ],
      [ 'id', 'numPhotos' ],
      [ ',', ',' ],
      [ 'space', ' ' ],
      [ 'type', 'plural' ],
      [ ',', ',' ],
      [ 'space', ' ' ],
      [ 'selector', '=0' ],
      [ '{', '{' ],
      [ 'text', 'no photos' ],
      [ '}', '}' ],
      [ 'space', ' ' ],
      [ 'selector', '=1' ],
      [ '{', '{' ],
      [ 'text', 'one photo' ],
      [ '}', '}' ],
      [ 'space', ' ' ],
      [ 'selector', 'other' ],
      [ '{', '{' ],
      [ '#', '#' ],
      [ 'text', ' photos' ],
      [ '}', '}' ],
      [ '}', '}' ]
    ])
  })

  it('can parse("{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}")', function () {
    const tokens = []
    const msg = '{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}'
    expect(parse(msg, tokens)).to.deep.equal([
      [ 'numGuests', 'plural', 1, {
        '=0': [ 'no party' ],
        'one': [ 'host and a guest' ],
        'other': [ [ '#' ], ' guests' ]
      } ]
    ])
    expect(tokens).to.deep.equal([
      [ '{', '{' ],
      [ 'id', 'numGuests' ],
      [ ',', ',' ],
      [ 'space', ' ' ],
      [ 'type', 'plural' ],
      [ ',', ',' ],
      [ 'space', ' ' ],
      [ 'offset', 'offset' ],
      [ ':', ':' ],
      [ 'number', '1' ],
      [ 'space', ' ' ],
      [ 'selector', '=0' ],
      [ '{', '{' ],
      [ 'text', 'no party' ],
      [ '}', '}' ],
      [ 'space', ' ' ],
      [ 'selector', 'one' ],
      [ '{', '{' ],
      [ 'text', 'host and a guest' ],
      [ '}', '}' ],
      [ 'space', ' ' ],
      [ 'selector', 'other' ],
      [ '{', '{' ],
      [ '#', '#' ],
      [ 'text', ' guests' ],
      [ '}', '}' ],
      [ '}', '}' ]
    ])
  })

  it('can parse("{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}")', function () {
    const msg = '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
    expect(parse(msg)).to.deep.equal([
      [ 'rank', 'selectordinal', 0, {
        one: [ [ '#' ], 'st' ],
        two: [ [ '#' ], 'nd' ],
        few: [ [ '#' ], 'rd' ],
        other: [ [ '#' ], 'th' ]
      } ]
    ])
  })

  it('can parse("{gender, select, female {woman} male {man} other {person}}")', function () {
    const msg = '{gender, select, female {woman} male {man} other {person}}'
    expect(parse(msg)).to.deep.equal([
      [ 'gender', 'select', {
        female: [ 'woman' ],
        male: [ 'man' ],
        other: [ 'person' ]
      } ]
    ])
  })

  describe('whitespace', function () {
    it('should allow whitespace in and around text elements', function () {
      const msg = '   some random test   '
      const ast = parse(msg)
      expect(ast[0]).to.equal(msg)
    })

    it('should allow whitespace in argument elements', function () {
      expect(parse('{  num , number,percent  }')).to.deep.equal([
        [ 'num', 'number', 'percent' ]
      ])
    })
  })

  describe('escaping', function () {
    it('should allow escaping of syntax chars via `\'`', function () {
      expect(parse("'{'")[0]).to.equal('{')
      expect(parse("'}'")[0]).to.equal('}')
      expect(parse("''")[0]).to.equal("'")
      expect(parse("'{'''")[0]).to.equal("{'")
      expect(parse('#')[0]).to.equal('#')
      expect(parse("'")[0]).to.equal("'")

      expect(parse("{n,plural,other{#'#'}}")).to.deep.equal([
        [ 'n', 'plural', 0, {
          other: [ [ '#' ], '#' ]
        } ]
      ])
    })

    it('should always start an escape with `\'` in style text', function () {
      expect(parse("{n,date,'a style'}")).to.deep.equal([
        [ 'n', 'date', 'a style' ]
      ])
    })
  })
})
