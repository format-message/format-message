'use strict'

var rule = require('../../lib/rules/no-missing-plural-keyword')
var RuleTester = require('eslint').RuleTester

var settings = {
  'format-message': {
    generateId: 'literal',
    sourceLocale: 'en',
    translations: {
      en: './packages/eslint-plugin-format-message/__tests__/en.json',
      pt: './packages/eslint-plugin-format-message/__tests__/pt.json'
    }
  }
}

var tester = new RuleTester()
tester.run('no-missing-plural-keyword', rule, {
  valid: [
    {
      code: 'var f=require("format-message");f("{ p, plural, one {1} other {o} }")',
      settings: settings
    },
    {
      code: '<a translate="yes"><b><s>good { place_holder }</s></b></a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("{ p, selectordinal, other {o} }")',
      settings: settings,
      errors: [
        { message: 'Pattern is missing the "one" sub-message for placeholder "p"' },
        { message: 'Pattern is missing the "two" sub-message for placeholder "p"' },
        { message: 'Pattern is missing the "few" sub-message for placeholder "p"' },
        { message: 'Translation for en is missing the "one" sub-message for placeholder "p"' },
        { message: 'Translation for en is missing the "two" sub-message for placeholder "p"' },
        { message: 'Translation for en is missing the "few" sub-message for placeholder "p"' }
      ]
    },
    {
      code: 'var f=require("format-message");f("{ p, plural, other {o} }")',
      settings: settings,
      errors: [
        { message: 'Pattern is missing the "one" sub-message for placeholder "p"' },
        { message: 'Translation for en is missing the "one" sub-message for placeholder "p"' },
        { message: 'Translation for pt is missing the "one" sub-message for placeholder "p"' }
      ]
    }
  ]
})
