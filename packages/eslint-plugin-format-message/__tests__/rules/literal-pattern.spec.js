'use strict'

var rule = require('../../lib/rules/literal-pattern')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('literal-pattern', rule, {
  valid: [
    { code: 'var f=require("format-message");f("f")' },
    { code: 'var f=require("format-message");f.rich("f")' },
    { code: 'var f=require("format-message");f("f {b}")' },
    // scope tracking
    { code: 'var f=require("foo");formatMessage(foo)' },
    { code: 'var f=require("foo");formatMessage("f")' },
    { code: 'var f=require("format-message");formatMessage(foo)' },
    { code: 'var f=require("format-message");f("b")' },
    { code: 'import f from "foo";formatMessage("f")', parserOptions: { ecmaVersion: 6, sourceType: 'module' } },
    { code: 'import f from "format-message";formatMessage(foo)', parserOptions: { ecmaVersion: 6, sourceType: 'module' } },
    { code: 'import f from "format-message";f("b")', parserOptions: { ecmaVersion: 6, sourceType: 'module' } },
    { code: 'import {default as f} from "format-message";f("b")', parserOptions: { ecmaVersion: 6, sourceType: 'module' } },
    {
      code: 'import f from "format-message";f("f")',
      parser: 'babel-eslint',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' }
    }
  ],
  invalid: [
    {
      code: 'var f=require("format-message");f(somevar)',
      errors: [ { message: 'Pattern is not a string literal' } ]
    },
    {
      code: 'var f=require("format-message");f.rich(somevar)',
      errors: [ { message: 'Pattern is not a string literal' } ]
    },
    // scope tracking
    {
      code: 'var f=require("format-message");f(foo)',
      errors: [ { message: 'Pattern is not a string literal' } ]
    },
    {
      code: 'var fm=require("format-message");fm(a);function a(){var f=require("format-message");f(foo)};fm(after)',
      errors: [
        { message: 'Pattern is not a string literal' },
        { message: 'Pattern is not a string literal' },
        { message: 'Pattern is not a string literal' }
      ]
    },
    {
      code: 'var fm=require("format-message");fm(a);(function(){var f=require("format-message");f(foo)}());fm(after)',
      errors: [
        { message: 'Pattern is not a string literal' },
        { message: 'Pattern is not a string literal' },
        { message: 'Pattern is not a string literal' }
      ]
    },
    {
      code: 'import f from "format-message";f(b)',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [ { message: 'Pattern is not a string literal' } ]
    },
    {
      code: 'import {default as f} from "format-message";f(b)',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [ { message: 'Pattern is not a string literal' } ]
    },
    {
      code: 'import {default as f} from "format-message";f(b)',
      parser: 'babel-eslint',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [ { message: 'Pattern is not a string literal' } ]
    }
  ]
})
