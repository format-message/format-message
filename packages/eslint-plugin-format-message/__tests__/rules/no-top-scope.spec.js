'use strict'

var rule = require('../../lib/rules/no-top-scope')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('no-top-scope', rule, {
  valid: [
    {
      code: 'import f from "format-message"; export function g () { return f("f") }',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' }
    },
    { code: 'var f = require("format-message"); function g () { return f("f") }' }
  ],
  invalid: [
    {
      code: 'import f from "format-message"; f("f");',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ message: 'Translation will never be re-evaluated if locale changes' }]
    },
    {
      code: 'var f = require("format-message"); f("f");',
      errors: [{ message: 'Translation will never be re-evaluated if locale changes' }]
    }
  ]
})
