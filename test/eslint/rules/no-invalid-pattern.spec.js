'use strict'

var rule = require('../../../packages/eslint-plugin-format-message/lib/rules/no-invalid-pattern')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('no-invalid-pattern', rule, {
  valid: [
    { code: 'var f=require("format-message");f("f");b()' },
    { code: 'var f=require("format-message");f(f)' },
    { code: 'var f=require("format-message");f("f {b}")' }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("{")',
      errors: [ { message: 'Pattern is invalid: Expected argument id but end of input found in {' } ]
    },
    {
      code: 'var f=require("format-message");f("{foo,}")',
      errors: [ { message: 'Pattern is invalid: Expected number, date, time, ordinal, duration, spellout, plural, selectordinal, select but } found in {foo,}' } ]
    },
    {
      code: 'var f=require("format-message");f("}")',
      errors: [ { message: 'Pattern is invalid: Unexpected } found in }' } ]
    },
    {
      code: 'var f=require("format-message");f("{b,bogus}")',
      errors: [ { message: 'Pattern is invalid: Expected number, date, time, ordinal, duration, spellout, plural, selectordinal, select but bogus found in {b,bogus}' } ]
    }
  ]
})
