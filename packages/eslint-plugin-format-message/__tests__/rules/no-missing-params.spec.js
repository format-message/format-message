'use strict'

var rule = require('../../lib/rules/no-missing-params')
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
    { code: 'var f=require("format-message");f("h {b.c.d.t}", { "b": { "c": { "d": { "t": "t", "e": { "f": { "g": "g" }}}}}})' },
    { code: 'var f=require("format-message");f.rich("<a>b</a>", { a: function(props) { return props } })' },
    { code: 'var f=require("format-message");f.rich("<i>j</i>", { "i": function(props) { return props } })' },
    { code: 'var f=require("format-message");f("h{<i>}", { "<i>": "i" })' }
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
    },
    {
      code: 'var f=require("format-message");f.rich("<b>c</b>", { z:1 })',
      errors: [ { message: 'Pattern requires missing rich text "<b>" parameter' } ]
    },
    {
      code: 'var f=require("format-message");f.rich("<q>r</q>", { "<q>":1 })',
      errors: [ { message: 'Pattern requires missing rich text "<q>" parameter' } ]
    },
    {
      code: 'var f=require("format-message");f("o{<p>}", { p:1 })',
      errors: [ { message: 'Pattern requires missing "<p>" parameter' } ]
    }
  ]
})
