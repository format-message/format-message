/* eslint-env mocha */
const expect = require('chai').expect
const createElement = require('inferno-create-element').createElement
const formatChildren = require('../inferno').formatChildren

describe('inferno formatChildren with numeric index tags', function () {
  // ignore deprecation warnings
  const warn = console.warn
  before(function () {
    console.warn = function () {}
  })
  after(function () {
    console.warn = warn
  })

  it('returns a single child for simple messages', function () {
    const results = formatChildren('simple')
    expect(results).to.equal('simple')
  })

  it('preserves tokens with no element mapping', function () {
    const results = formatChildren('<0>simple</0>')
    expect(results).to.equal('<0>simple</0>')
  })

  it('returns a single child for wrapped messages', function () {
    const results = formatChildren('<0>simple</0>', [
      createElement('span')
    ])
    expect(results).to.deep.equal(createElement('span', null, 'simple'))
  })

  it('preserves the props of the wrappers', function () {
    const results = formatChildren('<0>simple</0>', [
      createElement('span', { className: 'foo' })
    ])
    expect(results).to.deep.equal(createElement('span', {
      className: 'foo'
    }, 'simple'))
  })

  it('returns an array of children when there are many', function () {
    const results = formatChildren('it was <0>his</0> fault', [
      createElement('em')
    ])
    expect(results).to.deep.equal([
      'it was ',
      createElement('em', null, 'his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    const results = formatChildren('<0><1><2><3>deep</3></2></1></0>', [
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

describe('inferno formatChildren with string tags', function () {
  // ignore deprecation warnings
  const warn = console.warn
  before(function () {
    console.warn = function () {}
  })
  after(function () {
    console.warn = warn
  })

  it('preserves tokens with no element mapping', function () {
    const results = formatChildren('<span>simple</span>')
    expect(results).to.equal('<span>simple</span>')
  })

  it('returns a single child for wrapped messages', function () {
    const results = formatChildren('<span>simple</span>', {
      span: createElement('span')
    })
    expect(results).to.deep.equal(createElement('span', null, 'simple'))
  })

  it('preserves the props of the wrappers', function () {
    const results = formatChildren('<span>simple</span>', {
      span: createElement('span', { className: 'foo' })
    })
    expect(results).to.deep.equal(createElement('span', {
      className: 'foo'
    }, 'simple'))
  })

  it('returns an array of children when there are many', function () {
    const results = formatChildren('it was <em>his</em> fault', {
      em: createElement('em')
    })
    expect(results).to.deep.equal([
      'it was ',
      createElement('em', null, 'his'),
      ' fault'
    ])
  })

  it('nests arbitrarily deep', function () {
    const results = formatChildren('<div><span><em><strong>deep</strong></em></span></div>', {
      div: createElement('div'),
      span: createElement('span'),
      em: createElement('em'),
      strong: createElement('strong')
    })
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
      formatChildren('<div><em><span><strong>deep</span></strong></em></div>', {
        div: createElement('div'),
        em: createElement('em'),
        span: createElement('span'),
        strong: createElement('strong')
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

  it('ignores invalid wrapper tags', function () {
    let result = formatChildren('<sp an>test</sp an>', { span: 'span' })
    expect(result).to.equal('<sp an>test</sp an>')

    result = formatChildren('<sp\nan>test</sp\nan>', { span: 'span' })
    expect(result).to.equal('<sp\nan>test</sp\nan>')

    result = formatChildren('<sp/an>test</sp/an>', { span: 'span' })
    expect(result).to.equal('<sp/an>test</sp/an>')

    result = formatChildren('<sp<an>test</sp<an>', { span: 'span' })
    expect(result).to.equal('<sp<an>test</sp<an>')

    result = formatChildren('<span class="foobar">test</span>', { span: 'span' })
    expect(result).to.equal('<span class="foobar">test</span>')
  })
})
