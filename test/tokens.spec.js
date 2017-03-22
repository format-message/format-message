/* global describe, it */
'use strict'

var expect = require('chai').expect
var tokens = require('../packages/format-message-parse/tokens')

describe('exports', function () {
  it('should be a function', function () {
    expect(tokens).to.be.a('function')
  })
})

describe('tokens()', function () {
  it('should return an object', function () {
    var result = tokens('')
    expect(result).to.be.an('object')
    expect(result).to.have.property('tokens')
    expect(result).to.have.property('lastIndex')
    expect(result).to.have.property('error')
  })

  describe('tokens("Hello, World!")', function () {
    var msg = 'Hello, World!'
    var result = tokens(msg)

    it('should contain correct tokens', function () {
      expect(result.tokens).to.deep.equal([
        [ 'text', msg ]
      ])
    })
  })

  describe('tokens("Hello, {name}!")', function () {
    var msg = 'Hello, {name}!'
    var result = tokens(msg)

    it('should contain correct tokens', function () {
      expect(result.tokens).to.deep.equal([
        [ 'text', 'Hello, ' ],
        [ '{', '{' ],
        [ 'id', 'name' ],
        [ '}', '}' ],
        [ 'text', '!' ]
      ])
    })
  })

  describe('tokens("{num, number, percent }")', function () {
    var msg = '{num, number, percent }'
    var result = tokens(msg)

    it('should contain correct tokens', function () {
      expect(result.tokens).to.deep.equal([
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
  })

  describe('tokens("{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}")', function () {
    var msg = '{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}'
    var result = tokens(msg)

    it('should contain correct tokens', function () {
      expect(result.tokens).to.deep.equal([
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
  })

  describe('tokens("{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}")', function () {
    var msg = '{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}'
    var result = tokens(msg)

    it('should contain the correct tokens', function () {
      expect(result.tokens).to.deep.equal([
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
  })

  describe('tokens("{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}")', function () {
    var msg = '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
    var result = tokens(msg)

    it('should contain the correct tokens', function () {
      expect(result.tokens).to.deep.equal([
        [ '{', '{' ],
        [ 'id', 'rank' ],
        [ ',', ',' ],
        [ 'space', ' ' ],
        [ 'type', 'selectordinal' ],
        [ ',', ',' ],
        [ 'space', ' ' ],
        [ 'selector', 'one' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ '#', '#' ],
        [ 'text', 'st' ],
        [ '}', '}' ],
        [ 'space', ' ' ],
        [ 'selector', 'two' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ '#', '#' ],
        [ 'text', 'nd' ],
        [ '}', '}' ],
        [ 'space', ' ' ],
        [ 'selector', 'few' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ '#', '#' ],
        [ 'text', 'rd' ],
        [ '}', '}' ],
        [ 'space', ' ' ],
        [ 'selector', 'other' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ '#', '#' ],
        [ 'text', 'th' ],
        [ '}', '}' ],
        [ '}', '}' ]
      ])
    })
  })

  describe('tokens("{gender, select, female {woman} male {man} other {person}}")', function () {
    var msg = '{gender, select, female {woman} male {man} other {person}}'
    var result = tokens(msg)

    it('should contain the correct tokens', function () {
      expect(result.tokens).to.deep.equal([
        [ '{', '{' ],
        [ 'id', 'gender' ],
        [ ',', ',' ],
        [ 'space', ' ' ],
        [ 'type', 'select' ],
        [ ',', ',' ],
        [ 'space', ' ' ],
        [ 'selector', 'female' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ 'text', 'woman' ],
        [ '}', '}' ],
        [ 'space', ' ' ],
        [ 'selector', 'male' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ 'text', 'man' ],
        [ '}', '}' ],
        [ 'space', ' ' ],
        [ 'selector', 'other' ],
        [ 'space', ' ' ],
        [ '{', '{' ],
        [ 'text', 'person' ],
        [ '}', '}' ],
        [ '}', '}' ]
      ])
    })
  })

  describe('whitespace', function () {
    it('should allow whitespace in and around text tokens', function () {
      var msg = '   some random test   '
      var result = tokens(msg)
      expect(result.tokens[0][1]).to.equal(msg)
    })

    it('should allow whitespace in argument tokens', function () {
      var msg = '{  num , number,percent  }'
      var result = tokens(msg)

      expect(result.tokens).to.deep.equal([
        [ '{', '{' ],
        [ 'space', '  ' ],
        [ 'id', 'num' ],
        [ 'space', ' ' ],
        [ ',', ',' ],
        [ 'space', ' ' ],
        [ 'type', 'number' ],
        [ ',', ',' ],
        [ 'style', 'percent' ],
        [ 'space', '  ' ],
        [ '}', '}' ]
      ])
    })
  })

  describe('escaping', function () {
    it('should allow escaping of syntax chars via `\'`', function () {
      expect(tokens("'{'").tokens[0]).to.deep.equal([ 'text', "'{'" ])
      expect(tokens("'}'").tokens[0]).to.deep.equal([ 'text', "'}'" ])
      expect(tokens("''").tokens[0]).to.deep.equal([ 'text', "''" ])
      expect(tokens("'{'''").tokens[0]).to.deep.equal([ 'text', "'{'''" ])
      expect(tokens('#').tokens[0]).to.deep.equal([ 'text', '#' ])
      expect(tokens("'").tokens[0]).to.deep.equal([ 'text', "'" ])

      var result = tokens("{n,plural,other{#'#'}}")
      expect(result.tokens).to.deep.equal([
        [ '{', '{' ],
        [ 'id', 'n' ],
        [ ',', ',' ],
        [ 'type', 'plural' ],
        [ ',', ',' ],
        [ 'selector', 'other' ],
        [ '{', '{' ],
        [ '#', '#' ],
        [ 'text', "'#'" ],
        [ '}', '}' ],
        [ '}', '}' ]
      ])
    })

    it('should always start an escape with `\'` in style text', function () {
      expect(tokens("{n,date,'a style'}").tokens).to.deep.equal([
        [ '{', '{' ],
        [ 'id', 'n' ],
        [ ',', ',' ],
        [ 'type', 'date' ],
        [ ',', ',' ],
        [ 'style', "'a style'" ],
        [ '}', '}' ]
      ])
    })
  })
})
