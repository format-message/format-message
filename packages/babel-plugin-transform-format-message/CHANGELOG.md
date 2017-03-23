# Changelog

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
