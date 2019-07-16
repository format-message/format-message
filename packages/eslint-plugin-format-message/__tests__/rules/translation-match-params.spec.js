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
    },
    {
      code: 'var f=require("format-message");' +
        'f.rich("<b>c</b>", { ' +
          'b: function(props) { return <b>{props.children}</b> } ' +
        '})',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    {
      code: 'var f=require("format-message");' +
        'f.rich("<s />", { ' +
          's: function(props) { return props } ' +
        '})',
      settings: settings
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("c", { c:"!" })',
      settings: settings,
      errors: [{ message: 'Translation for "c" in "en" has extra "c" placeholder' }]
    },
    {
      code: 'var f=require("format-message");f("bad2", foo)',
      settings: settings,
      errors: [{ message: 'Translation for "bad2" in "pt" has extra "z" placeholder' }]
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
    },
    {
      code: 'var f=require("format-message");' +
        'f.rich("<i>d</i>", { ' +
          'i: function(props) { return <i>{props.children}</i> } ' +
        '})',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [
        'Translation for "<i>d</i>" in "pt" is missing rich text "<i>" placeholder'
      ]
    },
    {
      code: 'var f=require("format-message");' +
        'f.rich("<u>e</u>", { ' +
          'u: function(props) { return <u>{props.children}</u> } ' +
        '})',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [
        'Translation for "<u>e</u>" in "pt" is missing rich text "<u>" placeholder',
        'Translation for "<u>e</u>" in "pt" has extra "u" placeholder'
      ]
    },
    {
      code: 'var f=require("format-message");' +
        'f.rich("<p>{f}</p>", { ' +
          'p: function(props) { return <p>{props.children}</p> } ' +
        '})',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [
        'Translation for "<p>{f}</p>" in "pt" is missing "f" placeholder'
      ]
    },
    {
      code: 'var f=require("format-message");' +
        'f.rich("<q>g</q>", { ' +
          'q: function(props) { return <q>{props.children}</q> } ' +
        '})',
      settings: settings,
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [
        'Translation for "<q>g</q>" in "pt" is missing rich text "<q>" placeholder',
        'Translation for "<q>g</q>" in "pt" has extra "<q>" placeholder'
      ]
    }
  ]
})
