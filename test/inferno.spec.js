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
    var results = formatChildren('<0>simple</0>')
    expect(results).to.equal('<0>simple</0>')
  })

  it('returns a single child for wrapped messages', function () {
    var results = formatChildren('<0>simple</0>', [
      Inferno.createVNode().setTag('span')
    ])
    expect(results).to.deep.equal(Inferno.createVNode().setTag('span').setChildren('simple'))
  })

  it('preserves the props of the wrappers', function () {
    var results = formatChildren('<0>simple</0>', [
      Inferno.createVNode().setTag('span').setAttrs({ className: 'foo' })
    ])
    expect(results).to.deep.equal(Inferno.createVNode().setTag('span').setAttrs({
      className: 'foo'
    }).setChildren('simple'))
  })

  it('returns an array of children when there are many', function () {
    var results = formatChildren('it was <0>his</0> fault', [
      Inferno.createVNode().setTag('em')
    ])
    expect(results).to.deep.equal([
      'it was ',
      Inferno.createVNode().setTag('em').setChildren('his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    var results = formatChildren('<0><1><2><3>deep</3></2></1></0>', [
      Inferno.createVNode().setTag('div'),
      Inferno.createVNode().setTag('span'),
      Inferno.createVNode().setTag('em'),
      Inferno.createVNode().setTag('strong')
    ])
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

  it('throws when wrapper tokens aren\'t nested properly', function () {
    expect(function () {
      formatChildren('<0><1><2><3>deep</2></3></1></0>', [
        Inferno.createVNode().setTag('div'),
        Inferno.createVNode().setTag('em'),
        Inferno.createVNode().setTag('span'),
        Inferno.createVNode().setTag('strong')
      ])
    }).to.throw()
  })

  it('throws when mappings aren\'t valid elements', function () {
    expect(function () {
      formatChildren('<0>test</0>', [ 'span' ])
    }).to.throw()
    expect(function () {
      formatChildren('<0>test</0>', [ {} ])
    }).to.throw()
    expect(function () {
      formatChildren('<0>test</0>', [ 1 ])
    }).to.throw()
  })
})
