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
    var results = formatChildren('<0>simple</0>')
    expect(results).to.equal('<0>simple</0>')
  })

  it('returns a single child for wrapped messages', function () {
    var results = formatChildren('<0>simple</0>', [
      React.createElement('span', { key: '0' })
    ])
    expect(results).to.deep.equal(React.createElement('span', { key: '0' }, 'simple'))
  })

  it('preserves the props of the wrappers', function () {
    var results = formatChildren('<0>simple</0>', [
      React.createElement('span', { className: 'foo', key: '0' })
    ])
    expect(results).to.deep.equal(React.createElement('span', {
      className: 'foo',
      key: '0'
    }, 'simple'))
  })

  it('creates a `key` prop if it is not defined', function () {
    var results = formatChildren('<0>simple</0>', [
      React.createElement('span', { className: 'foo' })
    ])
    expect(results).to.deep.equal(React.createElement('span', {
      className: 'foo',
      key: 'span::0'
    }, 'simple'))
  })

  it('returns an array of children when there are many', function () {
    var results = formatChildren('it was <0>his</0> fault', [
      React.createElement('em', { key: '0' })
    ])
    expect(results).to.deep.equal([
      'it was ',
      React.createElement('em', { key: '0' }, 'his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    var results = formatChildren('<0><1><2><3>deep</3></2></1></0>', [
      React.createElement('div', { key: '0' }),
      React.createElement('span', { key: '1' }),
      React.createElement('em', { key: '2' }),
      React.createElement('strong', { key: '3' })
    ])
    expect(results).to.deep.equal(
      React.createElement('div', { key: '0' },
        React.createElement('span', { key: '1' },
          React.createElement('em', { key: '2' },
            React.createElement('strong', { key: '3' }, 'deep')
          )
        )
      )
    )
  })

  it('throws when wrapper tokens aren\'t nested properly', function () {
    expect(function () {
      formatChildren('<0><1><2><3>deep</2></3></1></0>', [
        React.createElement('div', { key: '0' }),
        React.createElement('span', { key: '1' }),
        React.createElement('em', { key: '2' }),
        React.createElement('strong', { key: '3' })
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
