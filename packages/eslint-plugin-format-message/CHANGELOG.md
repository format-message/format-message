# Changelog

## 6.2.0

Add TypeScript type definitions.

## 6.0.4

Fixes `translation-match-params` to ignore missing translations.

## 6.0.3

Use `var` declarations for wider compatibility.

## 6.0.0

**New Feature**
* new rules to validate keywords of `plural` and `selectordinal`.
  * `no-invalid-plural-keywords` - warns when a keyword like `two` is used, but will never match for the locale.
  * `no-missing-plural-keywords` - warns when a keyword like `two` is not used, but matches some numbers in the locale.

## 5.2.6

Fix IE11 compat by removing template literals.

## 5.2.5

Made formatChildren more lenient in parsing.

## 5.2.3

Fix a bug affecting react-native apps.

## 5.1.0

Supports namespaced formatMessage.

## 5.0.0

**New Feature**
* new rules to support linting JSX messages with translate="yes"
  * `no-empty-jsx-message` - warns when there's no text found in a tag marked with translate="yes"
  * `no-invalid-translate-attribute` - warns when the translate attribute isn't "yes" or "no
* update existing rules to support linting JSX messages
  * `no-identical-translation` - includes JSX messages
  * `no-invalid-translation` - warns when a translation didn't preserve the wrapper tokens, or nested them incorrectly
  * `no-missing-translation` - includes JSX messages
  * `translation-match-params` - includes JSX messages
* added extends configs `plugin:format-message/default`, `plugin:format-message/recommended`

**Bug Fix**
* don't warn about duplicate translations with no text portions

## 4.2.0

**Bug Fix**
* fixed intermittent error with imports using babel-parser

**New Feature**
* `import {default as __} from 'format-message'` works as expected

## 4.1.0

**Bug Fix**
* fixed compatibility with ESLint 3.0

## 4.0.1

**Bug Fix**
* fixed compatibility with ESLint 1.10
* fixed variables declared without initializer, later called as functions causing error

## 4.0.0

**Breaking Change**
* `keyType` was renamed `generateId` to match new format-message

**New Feature**
* supports messages as an object with `id`, `default`, and `description`

## 0.3.0

**Breaking Change**
* all error messages have been shortened
* translations has been broken into several rules
* options for translations moved to `settings`

**New Feature**
* configure each rule for translations individually

## 0.2.0

**Breaking Change**
* change messages for translations issues

**New Feature**
* disallow extra and missing parameters in translated patterns

## 0.1.2

**New Feature**
* allow top-level translations to be a file path

## 0.1.1

**Bug Fixes**
* update format-message-core to fix bad # parameter warnings

## 0.1.0

**New Feature**
* eslint rules covering format-message lint
