/* eslint-env mocha */
var expect = require('chai').expect
var Inferno = require('inferno')
var formatChildren = require('../packages/format-message/inferno').formatChildren

describe('inferno formatChildren', function () {
  it('returns a single child for simple messages', function () {
    var results = formatChildren('simple')
    expect(results).to.equal('simple')
  })

  it('preserves tokens with no element mapping', function () {
    var results = formatChildren('_simple_')
    expect(results).to.equal('_simple_')
  })

  it('returns a single child for wrapped messages', function () {
    var results = formatChildren('_simple_', {
      _: Inferno.createVNode().setTag('span')
    })
    expect(results).to.deep.equal(Inferno.createVNode().setTag('span').setChildren('simple'))
  })

  it('preserves the props of the wrappers', function () {
    var results = formatChildren('_simple_', {
      _: Inferno.createVNode().setTag('span').setAttrs({ className: 'foo' })
    })
    expect(results).to.deep.equal(Inferno.createVNode().setTag('span').setAttrs({
      className: 'foo'
    }).setChildren('simple'))
  })

  it('returns an array of children when there are many', function () {
    var results = formatChildren('it was *his* fault', {
      '*': Inferno.createVNode().setTag('em')
    })
    expect(results).to.deep.equal([
      'it was ',
      Inferno.createVNode().setTag('em').setChildren('his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    var results = formatChildren('__**_*deep*_**__', {
      '__': Inferno.createVNode().setTag('div'),
      '_': Inferno.createVNode().setTag('em'),
      '**': Inferno.createVNode().setTag('span'),
      '*': Inferno.createVNode().setTag('strong')
    })
    expect(results).to.deep.equal(
      Inferno.createVNode().setTag('div').setChildren(
        Inferno.createVNode().setTag('span').setChildren(
          Inferno.createVNode().setTag('em').setChildren(
            Inferno.createVNode().setTag('strong').setChildren('deep')
          )
        )
      )
    )
  })

  it('ignores leading and trailing space inside wrapper', function () {
    var results = formatChildren('hello _ * big * __world__ _', {
      '_': Inferno.createVNode().setTag('div'),
      '__': Inferno.createVNode().setTag('em'),
      '*': Inferno.createVNode().setTag('strong')
    })
    expect(results).to.deep.equal([
      'hello ',
      Inferno.createVNode().setTag('div').setChildren([
        Inferno.createVNode().setTag('strong').setChildren('big'),
        ' ',
        Inferno.createVNode().setTag('em').setChildren('world')
      ])
    ])
  })

  it('throws when wrapper tokens aren\'t nested properly', function () {
    expect(function () {
      formatChildren('__**_*deep**_*__', {
        '__': Inferno.createVNode().setTag('div'),
        '_': Inferno.createVNode().setTag('em'),
        '**': Inferno.createVNode().setTag('span'),
        '*': Inferno.createVNode().setTag('strong')
      })
    }).to.throw()
  })

  it('throws when mappings aren\'t valid elements', function () {
    expect(function () {
      formatChildren('_test_', { '_': 'span' })
    }).to.throw()
    expect(function () {
      formatChildren('_test_', { '_': {} })
    }).to.throw()
    expect(function () {
      formatChildren('_test_', { '_': null })
    }).to.throw()
  })
})
