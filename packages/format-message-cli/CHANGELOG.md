# Changelog

## 6.2.0

Add TypeScript type definitions.

## 6.1.0

Uses babel 7 under the hood. Supports projects with .babelrc using v7 features.

## 6.0.3

Use `var` declarations for wider compatibility.

## 6.0.0

**Breaking Change**
The default for generateId is now `literal` to match the runtime. You will need to add `-g underscored_crc32` to your cli commands if you were using the default before.

`-j` `--jsx-target` flags have been removed from `transform` since it relies on the `formatMessage.rich` function instead of `formatChildren`, and is no longer JSX library specific.

## 5.2.6

Fix IE11 compat by removing template literals.

## 5.2.5

Made formatChildren more lenient in parsing.

## 5.2.4

Fix extract failing on dynamic `import()` syntax.

## 5.2.3

Fix a bug affecting react-native apps.

## 5.2.2

Added the `--extends` and `--customrules` cli options.

## 5.1.4

- Fixed placeholder style names with spaces or other special characters.
- Fixed warnings about needing keys on transformed translate="yes" children.

## 5.1.0

Support namespacing formatMessage.
Assume any module that ends with '/format-message' exports a namespaced formatMessage.

## 5.0.0

Support extracting, linting, and transforming format-message v5 use.

## 4.1.0

**New Feature**
  * `import {default as __} from 'format-message'` works as expected

## 4.0.2

Updated internal eslint to v2. The cli assumes your source code is an ES6
module, so import and export are allowed.

## 4.0.1

Don't use babel-eslint for the lint command, as it causes more issues than it solves.
Users that need ES7+ features can use the eslint-plugin-format-message directly.

## 4.0.0

Entirely rewritten cli using the babel and eslint plugins, and aligning to the
4.x format-message option naming.
