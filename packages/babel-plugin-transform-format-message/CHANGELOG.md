# Changelog

## 6.1.0

Uses babel 7.

## 6.0.3

Use `var` declarations for wider compatibility.

## 6.0.0

Support `formatMessage.rich()`. Use that as the `translate='yes'` target instead of `formatChildren()`.

## 5.2.6

Fix IE11 compat by removing template literals.

## 5.2.5

Made formatChildren more lenient in parsing.

## 5.2.3

Fix a bug affecting react-native apps.

## 5.2.1

Updated CLDR plural rules.

## 5.1.4

- Fixed placeholder style names with spaces or other special characters.
- Fixed warnings about needing keys on transformed translate="yes" children.

## 5.1.0

Supports namespaced formatMessage.

## 5.0.0

**New Feature**
  * Transform messages from JSX marked with translate="yes"
  * Allow `missingReplacement` to be a function
  * Remove format-message import if all uses were inlined

## 4.1.0

**New Feature**
  * `import {default as __} from 'format-message'` works as expected
