/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var parse = require('..')
var SyntaxError = parse.SyntaxError

describe('parse()', function () {
  it('coerces pattern to a string', function () {
    expect(parse()).to.deep.equal(['undefined'])
    expect(parse(null)).to.deep.equal(['null'])
    expect(parse(12.34)).to.deep.equal(['12.34'])
    expect(parse({ toString: function () { return '' } })).to.deep.equal([])
  })

  it('can parse "Hello, World!"', function () {
    var msg = 'Hello, World!'
    expect(parse(msg)).to.deep.equal([msg])
  })

  it('can parse "Hello, {name}!"', function () {
    expect(parse('Hello, {name}!')).to.deep.equal([
      'Hello, ',
      ['name'],
      '!'
    ])
  })

  it('can parse "{n,number}"', function () {
    expect(parse('{n,number}')).to.deep.equal([
      ['n', 'number']
    ])
  })

  it('can parse "{num, number, percent }"', function () {
    expect(parse('{num, number, percent }')).to.deep.equal([
      ['num', 'number', 'percent']
    ])
  })

  it('can parse "{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}"', function () {
    var msg = '{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}'
    expect(parse(msg)).to.deep.equal([
      ['numPhotos', 'plural', 0, {
        '=0': ['no photos'],
        '=1': ['one photo'],
        other: [['#'], ' photos']
      }]
    ])
  })

  it('can parse "{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}"', function () {
    var msg = '{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}'
    expect(parse(msg)).to.deep.equal([
      ['numGuests', 'plural', 1, {
        '=0': ['no party'],
        one: ['host and a guest'],
        other: [['#'], ' guests']
      }]
    ])
  })

  it('can parse "{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}"', function () {
    var msg = '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}'
    expect(parse(msg)).to.deep.equal([
      ['rank', 'selectordinal', 0, {
        one: [['#'], 'st'],
        two: [['#'], 'nd'],
        few: [['#'], 'rd'],
        other: [['#'], 'th']
      }]
    ])
  })

  it('can parse "{gender, select, female {woman} male {man} other {person}}"', function () {
    var msg = '{gender, select, female {woman} male {man} other {person}}'
    expect(parse(msg)).to.deep.equal([
      ['gender', 'select', {
        female: ['woman'],
        male: ['man'],
        other: ['person']
      }]
    ])
  })

  it('can parse "{a, custom, one}"', function () {
    expect(parse('{a, custom, one}')).to.deep.equal([
      ['a', 'custom', 'one']
    ])
  })

  it('can parse "{<0/>,</>,void}"', function () {
    expect(parse('{<0/>,</>,void}')).to.deep.equal([
      ['<0/>', '</>', 'void']
    ])
  })

  it('can parse "{<0/>,</>,void}" with tagsType', function () {
    expect(parse('{<0/>,</>,void}', { tagsType: '<>' })).to.deep.equal([
      ['<0/>', '</>', 'void']
    ])
  })

  it('can parse "{a,<,>{click here}}"', function () {
    expect(parse('{a,<,>{click here}}')).to.deep.equal([
      ['a', '<', {
        '>': ['click here']
      }]
    ])
  })

  it('can parse "{a,<,>{click here}}" with tagsType', function () {
    expect(parse('{a,<,>{click here}}', { tagsType: '<>' })).to.deep.equal([
      ['a', '<', {
        '>': ['click here']
      }]
    ])
  })

  it('ignores angle brackets by default', function () {
    expect(parse('</close>')).to.deep.equal(['</close>'])
  })

  it('can parse simple xml tags as placeholders', function () {
    expect(parse('<a><i/>here</a>', { tagsType: '_' })).to.deep.equal([
      ['a', '_', {
        children: [['i', '_'], 'here']
      }]
    ])
  })

  it('can escape simple xml tags like other special syntax', function () {
    expect(parse('\'<a><i/>\'here\'</a>\'', { tagsType: '_' })).to.deep.equal([
      '<a><i/>here</a>'
    ])
  })

  describe('tokens', function () {
    it('can parse "Hello, World!"', function () {
      var tokens = []
      var msg = 'Hello, World!'
      expect(parse(msg, { tokens: tokens })).to.deep.equal([msg])
      expect(tokens).to.deep.equal([['text', msg]])
    })

    it('can parse "Hello, {name}!"', function () {
      var tokens = []
      expect(parse('Hello, {name}!', { tokens: tokens })).to.deep.equal([
        'Hello, ',
        ['name'],
        '!'
      ])
      expect(tokens).to.deep.equal([
        ['text', 'Hello, '],
        ['syntax', '{'],
        ['id', 'name'],
        ['syntax', '}'],
        ['text', '!']
      ])
    })

    it('can parse "{n,number}"', function () {
      var tokens = []
      expect(parse('{n,number}', { tokens: tokens })).to.deep.equal([
        ['n', 'number']
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '{'],
        ['id', 'n'],
        ['syntax', ','],
        ['type', 'number'],
        ['syntax', '}']
      ])
    })

    it('can parse "{num, number, percent }"', function () {
      var tokens = []
      expect(parse('{num, number, percent }', { tokens: tokens })).to.deep.equal([
        ['num', 'number', 'percent']
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '{'],
        ['id', 'num'],
        ['syntax', ','],
        ['space', ' '],
        ['type', 'number'],
        ['syntax', ','],
        ['space', ' '],
        ['style', 'percent'],
        ['space', ' '],
        ['syntax', '}']
      ])
    })

    it('can parse "{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}"', function () {
      var tokens = []
      var msg = '{numPhotos, plural, =0{no photos} =1{one photo} other{# photos}}'
      expect(parse(msg, { tokens: tokens })).to.deep.equal([
        ['numPhotos', 'plural', 0, {
          '=0': ['no photos'],
          '=1': ['one photo'],
          other: [['#'], ' photos']
        }]
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '{'],
        ['id', 'numPhotos'],
        ['syntax', ','],
        ['space', ' '],
        ['type', 'plural'],
        ['syntax', ','],
        ['space', ' '],
        ['selector', '=0'],
        ['syntax', '{'],
        ['text', 'no photos'],
        ['syntax', '}'],
        ['space', ' '],
        ['selector', '=1'],
        ['syntax', '{'],
        ['text', 'one photo'],
        ['syntax', '}'],
        ['space', ' '],
        ['selector', 'other'],
        ['syntax', '{'],
        ['syntax', '#'],
        ['text', ' photos'],
        ['syntax', '}'],
        ['syntax', '}']
      ])
    })

    it('can parse "{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}"', function () {
      var tokens = []
      var msg = '{numGuests, plural, offset:1 =0{no party} one{host and a guest} other{# guests}}'
      expect(parse(msg, { tokens: tokens })).to.deep.equal([
        ['numGuests', 'plural', 1, {
          '=0': ['no party'],
          one: ['host and a guest'],
          other: [['#'], ' guests']
        }]
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '{'],
        ['id', 'numGuests'],
        ['syntax', ','],
        ['space', ' '],
        ['type', 'plural'],
        ['syntax', ','],
        ['space', ' '],
        ['offset', 'offset'],
        ['syntax', ':'],
        ['number', '1'],
        ['space', ' '],
        ['selector', '=0'],
        ['syntax', '{'],
        ['text', 'no party'],
        ['syntax', '}'],
        ['space', ' '],
        ['selector', 'one'],
        ['syntax', '{'],
        ['text', 'host and a guest'],
        ['syntax', '}'],
        ['space', ' '],
        ['selector', 'other'],
        ['syntax', '{'],
        ['syntax', '#'],
        ['text', ' guests'],
        ['syntax', '}'],
        ['syntax', '}']
      ])
    })

    it('can parse "{a,b,c,d}"', function () {
      var tokens = []
      expect(parse('{a,b,c,d}', { tokens: tokens })).to.deep.equal([
        ['a', 'b', 'c,d']
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '{'],
        ['id', 'a'],
        ['syntax', ','],
        ['type', 'b'],
        ['syntax', ','],
        ['style', 'c,d'],
        ['syntax', '}']
      ])
    })

    it('can parse simple xml tags as placeholders', function () {
      var tokens = []
      expect(parse('<a><i/>here</a>', { tokens: tokens, tagsType: '_' })).to.deep.equal([
        ['a', '_', {
          children: [['i', '_'], 'here']
        }]
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '<'],
        ['id', 'a'],
        ['syntax', '>'],
        ['syntax', '<'],
        ['id', 'i'],
        ['syntax', '/>'],
        ['text', 'here'],
        ['syntax', '</'],
        ['id', 'a'],
        ['syntax', '>']
      ])
    })
  })

  describe('whitespace', function () {
    it('should allow whitespace in and around text elements', function () {
      var msg = '   some random test   '
      var ast = parse(msg)
      expect(ast[0]).to.equal(msg)
    })

    it('should allow whitespace in argument elements', function () {
      expect(parse('{  num , number,percent  }')).to.deep.equal([
        ['num', 'number', 'percent']
      ])
    })

    it('should consider lots of kinds of whitespace', function () {
      var white = ' \t\v\r\n\u0085\u00A0\u180E\u2001\u2028\u2029\u202F\u205F\u2060\u3000\uFEFF'
      var msg = white + '{' + white + 'p}'
      var tokens = []
      expect(parse(msg, { tokens: tokens })).to.deep.equal([
        white,
        ['p']
      ])
      expect(tokens).to.deep.equal([
        ['text', white],
        ['syntax', '{'],
        ['space', white],
        ['id', 'p'],
        ['syntax', '}']
      ])
    })

    it('allows trailing whitespace in simple xml tags', function () {
      var tokens = []
      expect(parse('<a ><i\n/>here</a\t >', { tokens: tokens, tagsType: '_' })).to.deep.equal([
        ['a', '_', {
          children: [['i', '_'], 'here']
        }]
      ])
      expect(tokens).to.deep.equal([
        ['syntax', '<'],
        ['id', 'a'],
        ['space', ' '],
        ['syntax', '>'],
        ['syntax', '<'],
        ['id', 'i'],
        ['space', '\n'],
        ['syntax', '/>'],
        ['text', 'here'],
        ['syntax', '</'],
        ['id', 'a'],
        ['space', '\t '],
        ['syntax', '>']
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
        ['n', 'plural', 0, {
          other: [['#'], '#']
        }]
      ])
    })

    it('should always start an escape with `\'` in style text', function () {
      expect(parse("{n,date,'a style'}")).to.deep.equal([
        ['n', 'date', 'a style']
      ])
    })
  })

  it('throws on extra closing brace', function () {
    expect(function () { parse('}') })
      .to.throw(SyntaxError, 'Unexpected } found')
  })

  it('throws on empty placeholder', function () {
    var tokens = []
    expect(function () { parse('{}', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected placeholder id but found }')
    expect(tokens).to.deep.equal([
      ['syntax', '{']
    ])
  })

  it('throws on open brace in placeholder', function () {
    var tokens = []
    expect(function () { parse('{n{', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected , or } but found {')
    expect(tokens).to.deep.equal([
      ['syntax', '{'],
      ['id', 'n']
    ])
  })

  it('throws on missing type', function () {
    var tokens = []
    expect(function () { parse('{n,}', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected placeholder type but found }')
    expect(tokens).to.deep.equal([
      ['syntax', '{'],
      ['id', 'n'],
      ['syntax', ',']
    ])
  })

  it('throws on open brace after type', function () {
    var tokens = []
    expect(function () { parse('{n,d{', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected , or } but found {')
    expect(tokens).to.deep.equal([
      ['syntax', '{'],
      ['id', 'n'],
      ['syntax', ','],
      ['type', 'd']
    ])
  })

  it('throws on missing style', function () {
    var tokens = []
    expect(function () { parse('{n,t,}', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected placeholder style name but found }')
    expect(tokens).to.deep.equal([
      ['syntax', '{'],
      ['id', 'n'],
      ['syntax', ','],
      ['type', 't'],
      ['syntax', ',']
    ])
  })

  it('throws on missing sub-messages for select', function () {
    expect(function () { parse('{n,select}') })
      .to.throw(SyntaxError, 'Expected select sub-messages but found }')
  })

  it('throws on missing sub-messages for selectordinal', function () {
    expect(function () { parse('{n,selectordinal}') })
      .to.throw(SyntaxError, 'Expected selectordinal sub-messages but found }')
  })

  it('throws on missing sub-messages for plural', function () {
    expect(function () { parse('{n,plural}') })
      .to.throw(SyntaxError, 'Expected plural sub-messages but found }')
  })

  it('throws on missing other for select', function () {
    expect(function () { parse('{n,select,}') })
      .to.throw(SyntaxError, '"other" sub-message must be specified in select')
  })

  it('throws on missing other for selectordinal', function () {
    expect(function () { parse('{n,selectordinal,}') })
      .to.throw(SyntaxError, '"other" sub-message must be specified in selectordinal')
  })

  it('throws on missing other for plural', function () {
    expect(function () { parse('{n,plural,}') })
      .to.throw(SyntaxError, '"other" sub-message must be specified in plural')
  })

  it('throws on missing selector', function () {
    expect(function () { parse('{n,select,{a}}') })
      .to.throw(SyntaxError, 'Expected sub-message selector but found {')
  })

  it('throws on missing { for sub-message', function () {
    expect(function () { parse('{n,select,other a}') })
      .to.throw(SyntaxError, 'Expected { to start sub-message but found a')
  })

  it('throws on missing } for sub-message', function () {
    expect(function () { parse('{n,select,other{a') })
      .to.throw(SyntaxError, 'Expected } to end sub-message but found end of message pattern')
  })

  it('throws on missing offset number', function () {
    var tokens = []
    expect(function () { parse('{n,plural,offset:}', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected offset number but found }')
    expect(tokens).to.deep.equal([
      ['syntax', '{'],
      ['id', 'n'],
      ['syntax', ','],
      ['type', 'plural'],
      ['syntax', ','],
      ['offset', 'offset'],
      ['syntax', ':']
    ])
  })

  it('throws on missing closing brace', function () {
    var tokens = []
    expect(function () { parse('{a,b,c', { tokens: tokens }) })
      .to.throw(SyntaxError, 'Expected } but found end of message pattern')
    expect(tokens).to.deep.equal([
      ['syntax', '{'],
      ['id', 'a'],
      ['syntax', ','],
      ['type', 'b'],
      ['syntax', ','],
      ['style', 'c']
    ])
  })

  it('throws on missing tag id', function () {
    var tokens = []
    expect(function () { parse('<>', { tokens: tokens, tagsType: '<>' }) })
      .to.throw(SyntaxError, 'Expected placeholder id but found >')
    expect(tokens).to.deep.equal([
      ['syntax', '<']
    ])
  })

  it('throws on missing > at end of tag', function () {
    var tokens = []
    expect(function () { parse('<a', { tokens: tokens, tagsType: '<>' }) })
      .to.throw(SyntaxError, 'Expected > but found end of message pattern')
    expect(tokens).to.deep.equal([
      ['syntax', '<'],
      ['id', 'a']
    ])
  })

  it('throws on missing end tag', function () {
    var tokens = []
    expect(function () { parse('<a>', { tokens: tokens, tagsType: '<>' }) })
      .to.throw(SyntaxError, 'Expected </a> but found end of message pattern')
    expect(tokens).to.deep.equal([
      ['syntax', '<'],
      ['id', 'a'],
      ['syntax', '>']
    ])
  })

  it('throws on missing > at end of end tag', function () {
    var tokens = []
    expect(function () { parse('<a></a', { tokens: tokens, tagsType: '<>' }) })
      .to.throw(SyntaxError, 'Expected > but found end of message pattern')
    expect(tokens).to.deep.equal([
      ['syntax', '<'],
      ['id', 'a'],
      ['syntax', '>'],
      ['syntax', '</'],
      ['id', 'a']
    ])
  })

  it('throws on end tag with no start', function () {
    var tokens = []
    expect(function () { parse('</end>', { tokens: tokens, tagsType: '<>' }) })
      .to.throw(SyntaxError, 'Unexpected closing tag without matching opening tag found')
    expect(tokens).to.deep.equal([])
  })

  it('throws on mismatched end tag', function () {
    var tokens = []
    expect(function () { parse('<a></b>', { tokens: tokens, tagsType: '<>' }) })
      .to.throw(SyntaxError, 'Expected </a> but found </b>')
    expect(tokens).to.deep.equal([
      ['syntax', '<'],
      ['id', 'a'],
      ['syntax', '>'],
      ['syntax', '</'],
      ['id', 'b']
    ])
  })
})
