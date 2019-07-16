'use strict'

var rule = require('../../lib/rules/literal-locale')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('literal-locale', rule, {
  valid: [
    { code: 'var f=require("format-message");f("f", null, "en");b()' },
    { code: 'var f=require("format-message");f("f", null, `en`);b()', parserOptions: { ecmaVersion: 6 } },
    { code: 'var f=require("format-message");f("f {b}", { b: 1 }, "pt")' },
    { code: 'var f=require("format-message");f("f")' }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("f", null, locale)',
      errors: [{ message: 'Locale is not a string literal' }]
    }
  ]
})
