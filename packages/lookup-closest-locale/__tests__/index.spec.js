/* eslint-env mocha */
const expect = require('chai').expect
const lookup = require('..')

describe('lookupClosestLocale()', function () {
  it('returns locale if it is a key in the object', function () {
    expect(lookup('pt-BR', { 'pt-BR': 1 })).to.equal('pt-BR')
  })

  it('returns subtag that is a key in the object', function () {
    expect(lookup('pt-BR', { pt: 1 })).to.equal('pt')
  })

  it('returns undefined if locale is not a key in the object', function () {
    expect(lookup('pt-BR', { de: 1 })).to.equal(undefined)
    expect(lookup('', { de: 1 })).to.equal(undefined)
    expect(lookup(null, { de: 1 })).to.equal(undefined)
    expect(lookup(undefined, { de: 1 })).to.equal(undefined)
  })
})
