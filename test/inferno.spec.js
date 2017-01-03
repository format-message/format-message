/* eslint-env mocha */
var expect = require('chai').expect
var createElement = require('inferno-create-element')
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
      createElement('span')
    ])
    expect(results).to.deep.equal(createElement('span', null, 'simple'))
  })

  it('preserves the props of the wrappers', function () {
    var results = formatChildren('<0>simple</0>', [
      createElement('span', { className: 'foo' })
    ])
    expect(results).to.deep.equal(createElement('span', {
      className: 'foo'
    }, 'simple'))
  })

  it('returns an array of children when there are many', function () {
    var results = formatChildren('it was <0>his</0> fault', [
      createElement('em')
    ])
    expect(results).to.deep.equal([
      'it was ',
      createElement('em', null, 'his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    var results = formatChildren('<0><1><2><3>deep</3></2></1></0>', [
      createElement('div'),
      createElement('span'),
      createElement('em'),
      createElement('strong')
    ])
    expect(results).to.deep.equal(
      createElement('div', null,
        createElement('span', null,
          createElement('em', null,
            createElement('strong', null, 'deep')
          )
        )
      )
    )
  })

  it('throws when wrapper tokens aren\'t nested properly', function () {
    expect(function () {
      formatChildren('<0><1><2><3>deep</2></3></1></0>', [
        createElement('div'),
        createElement('em'),
        createElement('span'),
        createElement('strong')
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
