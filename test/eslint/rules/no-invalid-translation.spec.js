'use strict'

var rule = require('../../../packages/eslint-plugin-format-message/lib/rules/no-invalid-translation')
var RuleTester = require('eslint').RuleTester

var settings = { 'format-message': {
  generateId: 'literal',
  sourceLocale: 'en',
  translations: {
    en: './test/eslint/en.json',
    pt: './test/eslint/pt.json'
  }
} }

var tester = new RuleTester()
tester.run('no-invalid-translation', rule, {
  valid: [
    { code: 'var f=require("format-message");f(foo);b()' },
    { code: 'var f=require("format-message");f("}")' },
    { code: 'var f=require("format-message");f("a", null, "en")', settings: settings },
    { code: 'var f=require("format-message");f("b")', settings: settings },
    { code: 'var f=require("format-message");f("d")', settings: settings },
    {
      code: '<a translate="yes"><b><s>good</s></b></a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    {
      code: '<a translate="yes"><b><s>good { place_holder }</s></b></a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("bad1")',
      settings: settings,
      errors: [ { message: 'Translation for "bad1" in "pt" is invalid: Expected argument id but end of input found in {' } ]
    },
    {
      code: '<a translate="yes"><b><s>bad3</s></b></a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'Translation for "_*bad3*_" in "pt" is invalid: Wrapping tokens not properly nested in "_*malo3_*"' } ]
    }
  ]
})
