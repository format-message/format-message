'use strict'

var rule = require('../../lib/rules/no-invalid-pattern')
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
      errors: [{ message: 'Pattern is invalid: Expected placeholder id but found end of message pattern in {' }]
    },
    {
      code: 'var f=require("format-message");f("{foo,}")',
      errors: [{ message: 'Pattern is invalid: Expected placeholder type but found } in {foo,}' }]
    },
    {
      code: 'var f=require("format-message");f("}")',
      errors: [{ message: 'Pattern is invalid: Unexpected } found in }' }]
    },
    {
      code: 'var f=require("format-message");f.rich("</end>")',
      errors: [{ message: 'Pattern is invalid: Unexpected closing tag without matching opening tag found in </end>' }]
    }
  ]
})
