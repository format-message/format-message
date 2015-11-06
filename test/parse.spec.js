/* global describe, it */
'use strict'

var expect = require('chai').expect
var parse = require('../packages/format-message-parse')

describe('exports', function () {
  it('should be a function', function () {
    expect(parse).to.be.a('function')
  })

  it('should have a `SyntaxError` export', function () {
    expect(parse).to.have.property('SyntaxError')
    expect(parse.SyntaxError).to.be.a('function')
  })
})

describe('parse()', function () {
  it('should expect a String argument', function () {
    expect(function () { parse('') }).to.not.throw()

    expect(function () { parse() }).to.throw(parse.SyntaxError)
    expect(function () { parse(undefined) }).to.throw(parse.SyntaxError)
    expect(function () { parse(null) }).to.throw(parse.SyntaxError)
    expect(function () { parse(2) }).to.throw(parse.SyntaxError)
  })

  it('should return an AST array', function () {
    var ast = parse('')
    expect(ast).to.be.an('array')
    expect(ast).to.have.length(0)
  })

  describe('parse("Hello, World!")', function () {
    var msg = 'Hello, World!'
    var ast = parse(msg)

    it('should contain 1 element', function () {
      expect(ast).to.have.length(1)
    })

    it('should contain a text element', function () {
      var element = ast[0]
      expect(element).to.be.a('string')
      expect(element).to.equal(msg)
    })
  })

  describe('parse("Hello, {name}!")', function () {
    var msg = 'Hello, {name}!'
    var ast = parse(msg)

    it('should contain 3 elements', function () {
      expect(ast).to.have.length(3)
    })

    it('should first contain a text element', function () {
      var element = ast[0]
      expect(element).to.equal('Hello, ')
    })

    it('should then contain an argument element', function () {
      var element = ast[1]
      expect(element).to.be.an('array')
      expect(element).to.have.length(1)
      expect(element[0]).to.equal('name')
    })

    it('should finally contain a text element', function () {
      var element = ast[2]
      expect(element).to.equal('!')
    })
  })

  describe('parse("{num, number, percent }")', function () {
    var msg = '{num, number, percent }'
    var ast = parse(msg)

    it('should contain 1 element', function () {
      expect(ast).to.have.length(1)
    })

    it('should contain an argument element', function () {
      var element = ast[0]
      expect(element).to.be.an('array')
      expect(element).to.have.length(3)
      expect(element[0]).to.equal('num')
      expect(element[1]).to.equal('number')
      expect(element[2]).to.equal('percent')
    })
  })

  describe('parse("{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}")', function () {
    var msg = '{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}'
    var ast = parse(msg)

    it('should contain 1 element', function () {
      expect(ast).to.have.length(1)
    })

    it('should contain an argument element', function () {
      var element = ast[0]
      expect(element).to.be.an('array')
      expect(element).to.have.length(4)
      expect(element[0]).to.equal('numPhotos')
      expect(element[1]).to.equal('plural')
      expect(element[2]).to.equal(0)
    })

    it('should contain 3 options', function () {
      var options = ast[0][3]
      expect(options).to.have.all.keys([ '=0', '=1', 'other' ])
    })

    it('should contain nested message pattern values for each option', function () {
      var options = ast[0][3]

      var value = options['=0']
      expect(value).to.be.an('array')
      expect(value).to.have.length(1)
      expect(value[0]).to.equal('no photos')

      expect(options['=1'][0]).to.equal('one photo')
      expect(options.other[0]).to.be.an('array')
      expect(options.other[0]).to.have.length(1)
      expect(options.other[0][0]).to.equal('#')
      expect(options.other[1]).to.equal(' photos')
    })
  })

  describe('parse("{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}")', function () {
    var msg = '{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}'
    var ast = parse(msg)

    it('should contain 1 element', function () {
      expect(ast).to.have.length(1)
    })

    it('should contain an argument element', function () {
      var element = ast[0]
      expect(element).to.be.an('array')
      expect(element).to.have.length(4)
      expect(element[0]).to.equal('numGuests')
      expect(element[1]).to.equal('plural')
      expect(element[2]).to.equal(1)
    })

    it('should contain 3 options', function () {
      var options = ast[0][3]
      expect(options).to.have.all.keys([ '=0', 'one', 'other' ])
    })

    it('should contain nested message pattern values for each option', function () {
      var options = ast[0][3]

      var value = options['=0']
      expect(value).to.be.an('array')
      expect(value).to.have.length(1)
      expect(value[0]).to.equal('no party')

      expect(options.one[0]).to.equal('host and a guest')
      expect(options.other[0]).to.be.an('array')
      expect(options.other[0]).to.have.length(1)
      expect(options.other[0][0]).to.equal('#')
      expect(options.other[1]).to.equal(' guests')
    })
  })

  describe('parse("{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}")', function () {
    var msg = '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
    var ast = parse(msg)

    it('should contain 1 element', function () {
      expect(ast).to.have.length(1)
    })

    it('should contain an argument element', function () {
      var element = ast[0]
      expect(element).to.be.an('array')
      expect(element).to.have.length(4)
      expect(element[0]).to.equal('rank')
      expect(element[1]).to.equal('selectordinal')
      expect(element[2]).to.equal(0)
    })

    it('should contain 4 options', function () {
      var options = ast[0][3]
      expect(options).to.have.all.keys([ 'one', 'two', 'few', 'other' ])
    })

    it('should contain nested message pattern values for each option', function () {
      var options = ast[0][3]

      expect(options.one).to.be.an('array')
      expect(options.one).to.have.length(2)
      expect(options.one[0]).to.deep.equal([ '#' ])
      expect(options.one[1]).to.equal('st')
      expect(options.two).to.deep.equal([ [ '#' ], 'nd' ])
      expect(options.few).to.deep.equal([ [ '#' ], 'rd' ])
      expect(options.other).to.deep.equal([ [ '#' ], 'th' ])
    })
  })

  describe('parse("{gender, select, female {woman} male {man} other {person}}")', function () {
    var msg = '{gender, select, female {woman} male {man} other {person}}'
    var ast = parse(msg)

    it('should contain 1 element', function () {
      expect(ast).to.have.length(1)
    })

    it('should contain an argument element', function () {
      var element = ast[0]
      expect(element).to.be.an('array')
      expect(element[0]).to.equal('gender')
      expect(element[1]).to.equal('select')
    })

    it('should contain 3 options', function () {
      var options = ast[0][2]
      expect(options).to.have.all.keys([ 'female', 'male', 'other' ])
    })

    it('should contain nested message pattern values for each option', function () {
      var options = ast[0][2]

      expect(options.female).to.be.an('array')
      expect(options.female).to.have.length(1)
      expect(options.female[0]).to.equal('woman')
      expect(options.male[0]).to.equal('man')
      expect(options.other[0]).to.equal('person')
    })
  })

  describe('whitespace', function () {
    it('should allow whitespace in and around text elements', function () {
      var msg = '   some random test   '
      var ast = parse(msg)
      expect(ast[0]).to.equal(msg)
    })

    it('should allow whitespace in argument elements', function () {
      var msg = '{  num , number,percent  }'
      var ast = parse(msg)

      var element = ast[0]
      expect(element[0]).to.equal('num')
      expect(element[1]).to.equal('number')
      expect(element[2]).to.equal('percent')
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

      var ast = parse("{n,plural,other{#'#'}}")
      expect(ast[0][3].other[0]).to.be.an('array')
      expect(ast[0][3].other[0][0]).to.equal('#')
      expect(ast[0][3].other[1]).to.equal('#')
    })
  })
})
