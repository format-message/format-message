'use strict'

var rule = require('../../lib/rules/no-missing-translation')
var RuleTester = require('eslint').RuleTester

var settings = { 'format-message': {
  generateId: 'literal',
  sourceLocale: 'en',
  translations: {
    en: './packages/eslint-plugin-format-message/__tests__/en.json',
    pt: './packages/eslint-plugin-format-message/__tests__/pt.json'
  }
} }

var tester = new RuleTester()
tester.run('no-missing-translation', rule, {
  valid: [
    { code: 'var f=require("format-message");f(foo);b()' },
    { code: 'var f=require("format-message");f("}")' },
    { code: 'var f=require("format-message");f("a", null, "en")', settings: settings },
    { code: 'var f=require("format-message");f("b")', settings: settings },
    {
      code: '<a translate="yes">b</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("d")',
      settings: settings,
      errors: [ { message: 'Translation for "d" in "pt" is missing' } ]
    },
    {
      code: 'var f=require("format-message");f("e")',
      settings: settings,
      errors: [
        { message: 'Translation for "e" in "en" is missing' },
        { message: 'Translation for "e" in "pt" is missing' }
      ]
    },
    {
      code: '<a translate="yes">d</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'Translation for "d" in "pt" is missing' } ]
    }
  ]
})
