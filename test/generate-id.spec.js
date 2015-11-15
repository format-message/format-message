/* eslint-env mocha */
var expect = require('chai').expect
var generate = require('../packages/format-message-generate-id')

describe('format-message-generate-id', function () {
  describe('literal', function () {
    var messages = {
      'Mayan Temple at Yaxhá': 'Mayan Temple at Yaxhá',
      'Moroccan palace arches': 'Moroccan palace arches',
      '{error_message } Please try again by {clicking_here}.': '{error_message } Please try again by {clicking_here}.',
      '{ points, plural, =1 {1pt} other {#pts} }': '{ points, plural, =1 {1pt} other {#pts} }'
    }
    var id = generate.literal
    it('returns exactly what goes in', function () {
      Object.keys(messages).forEach(function (key) {
        expect(id(messages[key])).to.equal(key)
      })
    })
  })

  describe('normalized', function () {
    var messages = {
      'Mayan Temple at Yaxhá': 'Mayan Temple at Yaxhá',
      'Moroccan palace arches': 'Moroccan palace arches',
      '{ error_message } Please try again by { clicking_here }.': '{error_message } Please try again by {clicking_here}.',
      '{ points, plural, =1 {1pt} other {#pts} }': '{points, plural,\n =1 {1pt}\n other {#pts}}'
    }
    var id = generate.normalized
    it('returns underscored with crc', function () {
      Object.keys(messages).forEach(function (key) {
        expect(id(messages[key])).to.equal(key)
      })
    })
  })

  describe('underscored', function () {
    var messages = {
      'mayan_temple_at_yaxha': 'Mayan Temple at Yaxhá',
      'moroccan_palace_arches': 'Moroccan palace arches',
      'error_message_please_try_again_by_clicking_here': '{ error_message } Please try again by { clicking_here }.',
      'points_plural_1_1pt_other_pts': '{ points, plural, =1 {1pt} other {#pts} }'
    }
    var id = generate.underscored
    it('returns underscored with crc', function () {
      Object.keys(messages).forEach(function (key) {
        expect(id(messages[key])).to.equal(key)
      })
    })
  })

  describe('underscored_crc32', function () {
    var messages = {
      'mayan_temple_at_yaxha_53063adb': 'Mayan Temple at Yaxhá',
      'moroccan_palace_arches_64e00da4': 'Moroccan palace arches',
      'error_message_please_try_again_by_clicking_here_a9edb579': '{ error_message } Please try again by { clicking_here }.',
      'points_plural_1_1pt_other_pts_d43a9750': '{ points, plural, =1 {1pt} other {#pts} }'
    }
    var id = generate.underscored_crc32
    it('returns underscored with crc', function () {
      Object.keys(messages).forEach(function (key) {
        expect(id(messages[key])).to.equal(key)
      })
    })
  })
})
