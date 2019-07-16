/* eslint-env mocha */
'use strict'

var expect = require('chai').expect
var gen = require('..')

describe('generate id', function () {
  describe('literal', function () {
    it('simply returns the string argument', function () {
      expect(gen.literal('litoral')).to.equal('litoral')
    })

    var messages = {
      'Mayan Temple at Yaxhá': 'Mayan Temple at Yaxhá',
      'Moroccan palace arches': 'Moroccan palace arches',
      '{error_message } Please try again by {clicking_here}.': '{error_message } Please try again by {clicking_here}.',
      '{ points, plural, =1 {1pt} other {#pts} }': '{ points, plural, =1 {1pt} other {#pts} }'
    }
    it('returns exactly what goes in', function () {
      Object.keys(messages).forEach(function (key) {
        expect(gen.literal(messages[key])).to.equal(key)
      })
    })
  })

  describe('normalized', function () {
    it('parses the pattern and returns it pretty printed', function () {
      expect(gen.normalized('{  a,date,c}')).to.equal('{ a, date, c }')
      expect(gen.normalized('{a, date,c }')).to.equal('{ a, date, c }')
    })

    var messages = {
      'Mayan Temple at Yaxhá': 'Mayan Temple at Yaxhá',
      'Moroccan palace arches': 'Moroccan palace arches',
      '{ error_message } Please try again by { clicking_here }.': '{error_message } Please try again by {clicking_here}.',
      '{ points, plural, =1 {1pt} other {#pts} }': '{points, plural,\n =1 {1pt}\n other {#pts}}'
    }
    it('returns normalized', function () {
      Object.keys(messages).forEach(function (key) {
        expect(gen.normalized(messages[key])).to.equal(key)
      })
    })
  })

  describe('underscored', function () {
    it('removes accents', function () {
      expect(gen.underscored('olá×5')).to.equal('ola_5')
    })

    it('converts to lower case', function () {
      expect(gen.underscored('Hi')).to.equal('hi')
    })

    it('limits to 50 characters', function () {
      var str =
        '1234567890' +
        '1234567890' +
        '1234567890' +
        '1234567890' +
        '1234567890' +
        '1234567890'
      expect(gen.underscored(str).length).to.equal(50)
    })

    var messages = {
      mayan_temple_at_yaxha: 'Mayan Temple at Yaxhá',
      moroccan_palace_arches: 'Moroccan palace arches',
      error_message_please_try_again_by_clicking_here: '{ error_message } Please try again by { clicking_here }.',
      points_plural_1_1pt_other_pts: '{ points, plural, =1 {1pt} other {#pts} }'
    }
    it('returns underscored', function () {
      Object.keys(messages).forEach(function (key) {
        expect(gen.underscored(messages[key])).to.equal(key)
      })
    })
  })

  describe('underscored_crc32', function () {
    it('appends a hex crc32 to an underscored', function () {
      expect(gen.underscored_crc32('hi')).to.equal('hi_cbd0b723')
    })

    var messages = {
      mayan_temple_at_yaxha_53063adb: 'Mayan Temple at Yaxhá',
      moroccan_palace_arches_64e00da4: 'Moroccan palace arches',
      error_message_please_try_again_by_clicking_here_a9edb579: '{ error_message } Please try again by { clicking_here }.',
      points_plural_1_1pt_other_pts_d43a9750: '{ points, plural, =1 {1pt} other {#pts} }'
    }
    it('returns underscored with crc', function () {
      Object.keys(messages).forEach(function (key) {
        expect(gen.underscored_crc32(messages[key])).to.equal(key)
      })
    })
  })
})
