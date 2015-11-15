'use strict'

module.exports = {
  rules: {
    'literal-pattern': require('./lib/rules/literal-pattern'),
    'literal-locale': require('./lib/rules/literal-locale'),
    'no-identical-translation': require('./lib/rules/no-identical-translation'),
    'no-invalid-pattern': require('./lib/rules/no-invalid-pattern'),
    'no-invalid-translation': require('./lib/rules/no-invalid-translation'),
    'no-missing-params': require('./lib/rules/no-missing-params'),
    'no-missing-translation': require('./lib/rules/no-missing-translation'),
    'translation-match-params': require('./lib/rules/translation-match-params')
  },

  rulesConfig: {
    'literal-pattern': 1,
    'literal-locale': 1,
    'no-identical-translation': 1,
    'no-invalid-pattern': 2,
    'no-invalid-translation': 2,
    'no-missing-params': [ 2, { allowNonLiteral: true } ],
    'no-missing-translation': 1,
    'translation-match-params': 2
  }
}
