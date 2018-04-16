/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const plurals = require('../plurals')

describe('plurals', function () {
  const rules = 'zero one two few many other'.split(' ')
  const nums = [ -10, -1, 0, 0.1, 1, 1.01, 1.23, 2, 2.15, 3, 4, 6, 8, 14, 19, 25, 99, 101, 111, 112, 1000000 ]
  Object.keys(plurals).forEach(function (locale) {
    if (plurals[locale].cardinal) {
      it('has ' + locale + ' cardinal rules', function () {
        for (let i = 0; i < nums.length; i += 1) {
          expect(rules).to.include(plurals[locale].cardinal(nums[i]))
        }
      })
    }
    if (plurals[locale].ordinal) {
      it('has ' + locale + ' cardinal rules', function () {
        for (let i = 0; i < nums.length; i += 1) {
          expect(rules).to.include(plurals[locale].ordinal(nums[i]))
        }
      })
    }
  })

  it('knows correct English rules', function () {
    expect(plurals.en.cardinal(0)).to.equal('other')
    expect(plurals.en.cardinal(1)).to.equal('one')
    expect(plurals.en.cardinal('1.0')).to.equal('other')
    expect(plurals.en.cardinal(2)).to.equal('other')

    expect(plurals.en.ordinal(1)).to.equal('one')
    expect(plurals.en.ordinal(2)).to.equal('two')
    expect(plurals.en.ordinal(3)).to.equal('few')
    expect(plurals.en.ordinal(4)).to.equal('other')
    expect(plurals.en.ordinal(12)).to.equal('other')
    expect(plurals.en.ordinal(22)).to.equal('two')
  })
})
