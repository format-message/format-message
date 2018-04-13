'use strict'

var rule = require('../../lib/rules/no-empty-jsx-message')
var RuleTester = require('eslint').RuleTester

var tester = new RuleTester()
tester.run('no-empty-jsx-message', rule, {
  valid: [
    {
      code: '<a translate="yes"><b><s>good</s></b></a>',
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    {
      code: '<a translate="no"></a>',
      parserOptions: { ecmaFeatures: { jsx: true } }
    },
    {
      code: '<a></a>',
      parserOptions: { ecmaFeatures: { jsx: true } }
    }
  ],
  invalid: [
    {
      code: '<a translate="yes"></a>',
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'JSX element has nothing to translate' } ]
    },
    {
      code: '<a translate="yes" />',
      parserOptions: { ecmaFeatures: { jsx: true } },
      errors: [ { message: 'JSX element has nothing to translate' } ]
    }
  ]
})
