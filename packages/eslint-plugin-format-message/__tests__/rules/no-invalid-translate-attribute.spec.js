'use strict'

var rule = require('../../lib/rules/no-invalid-translate-attribute')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('no-invalid-translate-attribute', rule, {
  valid: [
    {
      code: '<a><b><s>good</s></b></a>',
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    {
      code: '<a {...atts}></a>',
      parserOptions: { ecmaVersion: 6, ecmaFeatures: { jsx: true } }
    },
    {
      code: '<a translate="yes"><b><s>good</s></b></a>',
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    {
      code: '<a translate="no"><b><s>good</s></b></a>',
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: '<a translate="bogus"></a>',
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [{ message: 'Attribute translate should be "yes" or "no"' }]
    },
    {
      code: '<a translate><b><s>bad3</s></b></a>',
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [{ message: 'Attribute translate should be "yes" or "no"' }]
    }
  ]
})
