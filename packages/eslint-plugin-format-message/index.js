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
    'no-top-scope': require('./lib/rules/no-top-scope'),
    'translation-match-params': require('./lib/rules/translation-match-params'),
    'no-empty-jsx-message': require('./lib/rules/no-empty-jsx-message'),
    'no-invalid-translate-attribute': require('./lib/rules/no-invalid-translate-attribute'),
    'no-invalid-plural-keyword': require('./lib/rules/no-invalid-plural-keyword'),
    'no-missing-plural-keyword': require('./lib/rules/no-missing-plural-keyword')
  },

  configs: {
    default: {
      rules: {
        'format-message/literal-pattern': 1,
        'format-message/literal-locale': 1,
        'format-message/no-identical-translation': 1,
        'format-message/no-invalid-pattern': 2,
        'format-message/no-invalid-translation': 2,
        'format-message/no-missing-params': [ 2, { allowNonLiteral: true } ],
        'format-message/no-missing-translation': 1,
        'format-message/no-top-scope': 0,
        'format-message/translation-match-params': 2,
        'format-message/no-empty-jsx-message': 1,
        'format-message/no-invalid-translate-attribute': 1,
        'format-message/no-invalid-plural-keyword': 1,
        'format-message/no-missing-plural-keyword': 0
      }
    },
    recommended: {
      rules: {
        'format-message/literal-pattern': 2,
        'format-message/literal-locale': 2,
        'format-message/no-identical-translation': 1,
        'format-message/no-invalid-pattern': 2,
        'format-message/no-invalid-translation': 2,
        'format-message/no-missing-params': 2,
        'format-message/no-missing-translation': 0,
        'format-message/no-top-scope': 0,
        'format-message/translation-match-params': 2,
        'format-message/no-empty-jsx-message': 2,
        'format-message/no-invalid-translate-attribute': 2,
        'format-message/no-invalid-plural-keyword': 2,
        'format-message/no-missing-plural-keyword': 1
      }
    }
  }
}
