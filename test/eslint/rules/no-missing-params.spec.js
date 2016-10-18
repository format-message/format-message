'use strict'

var rule = require('../../../packages/eslint-plugin-format-message/lib/rules/no-missing-params')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('no-missing-params', rule, {
  valid: [
    { code: 'var f=require("format-message");f("}");b()' },
    { code: 'var f=require("format-message");f("f")' },
    { code: 'var f=require("format-message");f("f {b}", { b:1 })' },
    { code: 'var f=require("format-message");f("f {b} {c}", { b:1, c:2 })' },
    { code: 'var f=require("format-message");f("f {b} {c}", bar)', options: [ { allowNonLiteral: true } ] },
    { code: 'var f=require("format-message");f("h {b.c}", { "b.c": "c" })' },
    { code: 'var f=require("format-message");f("h {b.c}", { "b": { "c": "c" }})' },
    { code: 'var f=require("format-message");f("h {b.c.d.e.f}", { "b": { "c": { "d": { "e": { "f": "f" }}}}})' },
    { code: 'var f=require("format-message");f("h {b.c.d.t}", { "b": { "c": { "d": { "t": "t", "e": { "f": { "g": "g" }}}}}})' }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f("{b}")',
      errors: [ { message: 'Pattern requires missing parameters' } ]
    },
    {
      code: 'var f=require("format-message");f("{foo}", bar)',
      options: [ { allowNonLiteral: false } ],
      errors: [ { message: 'Parameters is not an object literal' } ]
    },
    {
      code: 'var f=require("format-message");f("{a}", { b:1 })',
      errors: [ { message: 'Pattern requires missing "a" parameter' } ]
    },
    {
      code: 'var f=require("format-message");f("h {b.c}", { "b.d": "d" })',
      errors: [ { message: 'Pattern requires missing "b.c" parameter' } ]
    },
    {
      code: 'var f=require("format-message");f("h {b.c}", { "b": { "d": "d" } })',
      errors: [ { message: 'Pattern requires missing "b.c" parameter' } ]
    }
  ]
})
