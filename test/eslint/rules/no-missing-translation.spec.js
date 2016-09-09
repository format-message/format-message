'use strict'

var rule = require('../../../packages/eslint-plugin-format-message/lib/rules/no-missing-translation')
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
tester.run('no-missing-translation', rule, {
  valid: [
    { code: 'var f=require("format-message");f(foo);b()' },
    { code: 'var f=require("format-message");f("}")' },
    { code: 'var f=require("format-message");f("a", null, "en")', settings: settings },
    { code: 'var f=require("format-message");f("b")', settings: settings }
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
    }
  ]
})
