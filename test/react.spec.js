/* eslint-env mocha */
var expect = require('chai').expect
var React = require('react')
var formatChildren = require('../packages/format-message/react').formatChildren

describe('react formatChildren with numeric index tags', function () {
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

describe('react formatChildren with string tags', function () {
  it('preserves tokens with no element mapping', function () {
    var results = formatChildren('<span>simple</span>')
    expect(results).to.equal('<span>simple</span>')
  })

  it('returns a single child for wrapped messages', function () {
    var results = formatChildren('<span>simple</span>', {
      span: React.createElement('span')
    })
    expect(results).to.deep.equal(React.createElement('span', null, 'simple'))
  })

  it('preserves the props of the wrappers', function () {
    var results = formatChildren('<span>simple</span>', {
      span: React.createElement('span', { className: 'foo' })
    })
    expect(results).to.deep.equal(React.createElement('span', {
      className: 'foo'
    }, 'simple'))
  })

  it('returns an array of children when there are many', function () {
    var results = formatChildren('it was <em>his</em> fault', {
      em: React.createElement('em')
    })
    expect(results).to.deep.equal([
      'it was ',
      React.createElement('em', null, 'his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    var results = formatChildren('<div><span><em><strong>deep</strong></em></span></div>', {
      div: React.createElement('div'),
      span: React.createElement('span'),
      em: React.createElement('em'),
      strong: React.createElement('strong')
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
      formatChildren('<div><em><span><strong>deep</span></strong></em></div>', {
        div: React.createElement('div'),
        em: React.createElement('em'),
        span: React.createElement('span'),
        strong: React.createElement('strong')
      })
    }).to.throw()
  })

  it('throws when mappings aren\'t valid elements', function () {
    expect(function () {
      formatChildren('<span>test</span>', { span: 'span' })
    }).to.throw()
    expect(function () {
      formatChildren('<foo>test</foo>', { foo: {} })
    }).to.throw()
    expect(function () {
      formatChildren('<foo>test</foo>', { foo: 1 })
    }).to.throw()
  })

  it('throws when wrapper tag names aren\'t valid', function () {
    expect(function () {
      formatChildren('<sp an>test</sp an>', { span: 'span' })
    }).to.throw()
    expect(function () {
      formatChildren('<sp\nan>test</sp\nan>', { span: 'span' })
    }).to.throw()
    expect(function () {
      formatChildren('<sp/an>test</sp/an>', { span: 'span' })
    }).to.throw()
    expect(function () {
      formatChildren('<sp<an>test</sp<an>', { span: 'span' })
    }).to.throw()
  })
})
