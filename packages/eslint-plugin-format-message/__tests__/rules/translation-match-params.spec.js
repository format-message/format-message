'use strict'

var rule = require('../../lib/rules/translation-match-params')
var RuleTester = require('eslint').RuleTester

var settings = { 'format-message': {
  generateId: 'literal',
  sourceLocale: 'en',
  translations: './packages/eslint-plugin-format-message/__tests__/locales.json'
} }

var tester = new RuleTester()
tester.run('translation-match-params', rule, {
  valid: [
    { code: 'var f=require("format-message");f(foo);b()' },
    { code: 'var f=require("format-message");f("}")' },
    { code: 'var f=require("format-message");f("a", null, "en")', settings: settings },
    { code: 'var f=require("format-message");f("b")', settings: settings },
    { code: 'var f=require("format-message");f("d")', settings: settings },
    { code: 'var f=require("format-message");f("{missing}")', settings: settings },
    {
      code: '<a translate="yes">d</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("c", { c:"!" })',
      settings: settings,
      errors: [ { message: 'Translation for "c" in "en" has extra "c" placeholder' } ]
    },
    {
      code: 'var f=require("format-message");f("bad2", foo)',
      settings: settings,
      errors: [ { message: 'Translation for "bad2" in "pt" has extra "z" placeholder' } ]
    },
    {
      code: 'var f=require("format-message");f("{ k }", { k:"k" })',
      settings: settings,
      errors: [
        { message: 'Translation for "{ k }" in "pt" is missing "k" placeholder' },
        { message: 'Translation for "{ k }" in "pt" has extra "y" placeholder' }
      ]
    },
    {
      code: '<a translate="yes">{ k }</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [
        { message: 'Translation for "{ k }" in "pt" is missing "k" placeholder' },
        { message: 'Translation for "{ k }" in "pt" has extra "y" placeholder' }
      ]
    }
  ]
})
