'use strict'

var rule = require('../../../packages/eslint-plugin-format-message/lib/rules/no-identical-translation')
var RuleTester = require('eslint').RuleTester

var settings = { 'format-message': {
  generateId: 'literal',
  sourceLocale: 'en',
  translations: './test/eslint/locales.json'
} }

var tester = new RuleTester()
tester.run('no-identical-translation', rule, {
  valid: [
    { code: 'var f=require("format-message");f(foo);b()' },
    { code: 'var f=require("format-message");f("}")' },
    { code: 'var f=require("format-message");f("a", null, "en")', settings: settings },
    { code: 'var f=require("format-message");f("b")', settings: settings },
    { code: 'var f=require("format-message");f("d")', settings: settings }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("same")',
      settings: settings,
      errors: [ { message: 'Translation for "same" in "pt" is identical to original' } ]
    }
  ]
})
