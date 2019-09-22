'use strict'

var rule = require('../../lib/rules/no-invalid-plural-keyword')
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
tester.run('no-invalid-plural-keyword', rule, {
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
      code: 'var f=require("format-message");f("{ p, plural, one {1} two {2} other {o} }")',
      settings: settings,
      errors: [
        { message: 'en has no "two" cardinal plural rule' },
        { message: 'pt has no "two" cardinal plural rule' }
      ]
    },
    {
      code: 'var f=require("format-message");f("{ p, selectordinal, many {m} other {o} }")',
      settings: settings,
      errors: [
        { message: 'en has no "many" ordinal plural rule' },
        { message: 'pt has no "many" ordinal plural rule' }
      ]
    }
  ]
})
