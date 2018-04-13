'use strict'

var rule = require('../../lib/rules/no-identical-translation')
var RuleTester = require('eslint').RuleTester

var settings = { 'format-message': {
  generateId: 'literal',
  sourceLocale: 'en',
  translations: './packages/eslint-plugin-format-message/__tests__/locales.json'
} }

var tester = new RuleTester()
tester.run('no-identical-translation', rule, {
  valid: [
    { code: 'var f=require("format-message");f(foo);b()' },
    { code: 'var f=require("format-message");f("}")' },
    { code: 'var f=require("format-message");f("a", null, "en")', settings: settings },
    { code: 'var f=require("format-message");f("b")', settings: settings },
    { code: 'var f=require("format-message");f("d")', settings: settings },
    { code: 'var f=require("format-message");f("{i}", { i:1 })', settings: settings },
    {
      code: '<a translate="yes">b</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("same")',
      settings: settings,
      errors: [ { message: 'Translation for "same" in "pt" is identical to original' } ]
    },
    {
      code: 'var f=require("format-message");f("{ o, select, \\nother {o} }", {o:1})',
      settings: settings,
      errors: [ { message: 'Translation for "{ o, select, \nother {o} }" in "pt" is identical to original' } ]
    },
    {
      code: 'var f=require("format-message");f("{ o, plural, \\nother {o} }", {o:1})',
      settings: settings,
      errors: [ { message: 'Translation for "{ o, plural, \nother {o} }" in "pt" is identical to original' } ]
    },
    {
      code: '<a translate="yes">same</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'Translation for "same" in "pt" is identical to original' } ]
    },
    {
      code: 'var f=require("format-message");exports = <a translate="yes">{f.select(o,{other:"o"})}</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'Translation for "{ o, select, \nother {o} }" in "pt" is identical to original' } ]
    },
    {
      code: 'var p=require("format-message").plural;exports = <a translate="yes">{p(o,{other:"o"})}</a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'Translation for "{ o, plural, \nother {o} }" in "pt" is identical to original' } ]
    }
  ]
})
