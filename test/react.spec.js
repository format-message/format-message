/* eslint-env mocha */
var expect = require('chai').expect
var React = require('react')
var formatChildren = require('../packages/format-message/react').formatChildren

describe('react formatChildren', function () {
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
      _: React.createElement('span')
    })
    expect(results).to.deep.equal(React.createElement('span', null, 'simple'))
  })

  it('preserves the props of the wrappers', function () {
    var results = formatChildren('_simple_', {
      _: React.createElement('span', { className: 'foo' })
    })
    expect(results).to.deep.equal(React.createElement('span', {
      className: 'foo'
    }, 'simple'))
  })

  it('returns an array of children when there are many', function () {
    var results = formatChildren('it was *his* fault', {
      '*': React.createElement('em')
    })
    expect(results).to.deep.equal([
      'it was ',
      React.createElement('em', null, 'his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    var results = formatChildren('__**_*deep*_**__', {
      '__': React.createElement('div'),
      '_': React.createElement('em'),
      '**': React.createElement('span'),
      '*': React.createElement('strong')
    })
    expect(results).to.deep.equal(
      React.createElement('div', null,
        React.createElement('span', null,
          React.createElement('em', null,
            React.createElement('strong', null, 'deep')
          )
        )
      )
    )
  })

  it('throws when wrapper tokens aren\'t nested properly', function () {
    expect(function () {
      formatChildren('__**_*deep**_*__', {
        '__': React.createElement('div'),
        '_': React.createElement('em'),
        '**': React.createElement('span'),
        '*': React.createElement('strong')
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
