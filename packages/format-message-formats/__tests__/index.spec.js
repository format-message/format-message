/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const formats = require('..')

describe('formats', function () {
  describe('parseNumberPattern()', function () {
    it('handles currency', function () {
      expect(formats.parseNumberPattern('jpy')).to.eql({
        style: 'currency',
        currencyDisplay: 'symbol',
        currency: 'JPY'
      })

      expect(formats.parseNumberPattern('#,##0.00 ¤ EUR')).to.eql({
        style: 'currency',
        currencyDisplay: 'symbol',
        currency: 'EUR',
        useGrouping: true,
        minimumIntegerDigits: 1,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

      expect(formats.parseNumberPattern('0 ¤¤ cad')).to.eql({
        style: 'currency',
        currencyDisplay: 'code',
        currency: 'CAD',
        useGrouping: false,
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
      expect(formats.parseNumberPattern('0 ¤¤¤')).to.eql({
        style: 'currency',
        currencyDisplay: 'name',
        currency: 'USD',
        useGrouping: false,
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    })

    it('handles percentages', function () {
      expect(formats.parseNumberPattern('%')).to.eql({
        style: 'percent'
      })
      expect(formats.parseNumberPattern('#00.000%')).to.eql({
        style: 'percent',
        useGrouping: false,
        minimumIntegerDigits: 2,
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      })
    })

    it('handles fractions', function () {
      expect(formats.parseNumberPattern('#.#')).to.eql({
        useGrouping: false,
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      })
    })

    it('handles scientific notation as significant digits', function () {
      expect(formats.parseNumberPattern('0.##E+0')).to.eql({
        useGrouping: false,
        minimumSignificantDigits: 1,
        maximumSignificantDigits: 3
      })
    })

    it('handles significant digits', function () {
      expect(formats.parseNumberPattern('#,@@@')).to.eql({
        useGrouping: true,
        minimumSignificantDigits: 3,
        maximumSignificantDigits: 4
      })
    })

    it('ignores other characters', function () {
      expect(formats.parseNumberPattern('1~^/-_+|p')).to.equal(undefined)
    })
  })

  describe('parseDatePattern()', function () {
    it('handles era', function () {
      expect(formats.parseDatePattern('G')).to.eql({ era: 'short' })
      expect(formats.parseDatePattern('GGG')).to.eql({ era: 'short' })
      expect(formats.parseDatePattern('GGGG')).to.eql({ era: 'long' })
      expect(formats.parseDatePattern('GGGGG')).to.eql({ era: 'narrow' })
    })

    it('handles year', function () {
      expect(formats.parseDatePattern('Y')).to.eql({ year: 'numeric' })
      expect(formats.parseDatePattern('yy')).to.eql({ year: '2-digit' })
      expect(formats.parseDatePattern('yyyy')).to.eql({ year: 'numeric' })
    })

    it('handles month', function () {
      expect(formats.parseDatePattern('M')).to.eql({ month: 'numeric' })
      expect(formats.parseDatePattern('LL')).to.eql({ month: '2-digit' })
      expect(formats.parseDatePattern('MMM')).to.eql({ month: 'short' })
      expect(formats.parseDatePattern('LLLL')).to.eql({ month: 'long' })
      expect(formats.parseDatePattern('MMMMM')).to.eql({ month: 'narrow' })
    })

    it('handles weekday', function () {
      expect(formats.parseDatePattern('E')).to.eql({ weekday: 'short' })
      expect(formats.parseDatePattern('ccc')).to.eql({ weekday: 'short' })
      expect(formats.parseDatePattern('eeee')).to.eql({ weekday: 'long' })
      expect(formats.parseDatePattern('ccccc')).to.eql({ weekday: 'narrow' })
    })

    it('handles day', function () {
      expect(formats.parseDatePattern('D')).to.eql({ day: 'numeric' })
      expect(formats.parseDatePattern('dd')).to.eql({ day: '2-digit' })
      expect(formats.parseDatePattern('ddd')).to.eql({ day: 'numeric' })
    })

    it('handles hour', function () {
      expect(formats.parseDatePattern('h')).to.eql({ hour: 'numeric', hour12: true })
      expect(formats.parseDatePattern('H')).to.eql({ hour: 'numeric', hour12: false })
      expect(formats.parseDatePattern('KK')).to.eql({ hour: '2-digit', hour12: true })
      expect(formats.parseDatePattern('kk')).to.eql({ hour: '2-digit', hour12: false })
      expect(formats.parseDatePattern('KKK')).to.eql({ hour: 'numeric', hour12: true })
      expect(formats.parseDatePattern('HHH')).to.eql({ hour: 'numeric', hour12: false })
    })

    it('handles minute', function () {
      expect(formats.parseDatePattern('m')).to.eql({ minute: 'numeric' })
      expect(formats.parseDatePattern('mm')).to.eql({ minute: '2-digit' })
      expect(formats.parseDatePattern('mmm')).to.eql({ minute: 'numeric' })
    })

    it('handles second', function () {
      expect(formats.parseDatePattern('S')).to.eql({ second: 'numeric' })
      expect(formats.parseDatePattern('ss')).to.eql({ second: '2-digit' })
      expect(formats.parseDatePattern('sss')).to.eql({ second: 'numeric' })
    })

    it('handles timeZoneName', function () {
      expect(formats.parseDatePattern('z')).to.eql({ timeZoneName: 'short' })
      expect(formats.parseDatePattern('Z')).to.eql({ timeZoneName: 'short' })
      expect(formats.parseDatePattern('vv')).to.eql({ timeZoneName: 'long' })
      expect(formats.parseDatePattern('VVV')).to.eql({ timeZoneName: 'long' })
    })

    it('ignores other characters', function () {
      expect(formats.parseDatePattern('1~#/-_+|p')).to.equal(undefined)
    })
  })
})
