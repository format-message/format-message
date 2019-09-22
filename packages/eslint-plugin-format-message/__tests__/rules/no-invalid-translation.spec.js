'use strict'

var rule = require('../../lib/rules/no-invalid-translation')
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
      errors: [{ message: 'Translation for "bad1" in "pt" is invalid: Expected placeholder id but found end of message pattern in {' }]
    },
    {
      code: '<a translate="yes"><b><s>bad3</s></b></a>',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [{ message: 'Translation for "<0><1>bad3</1></0>" in "pt" is invalid: Expected </1> but found </0> in <0><1>malo</0></1>' }]
    }
  ]
})
