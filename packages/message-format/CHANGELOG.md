# Changelog

## 6.2.4

Update the TypeScript type definition for `MessageFormat.supportedLocalesOf()` to communicate that it is a static method.

## 6.2.0

Add TypeScript type definitions.

## 6.0.3

Use `var` declarations for wider compatibility.

## 6.0.0

**Breaking Change**
Calling MessageFormat without `new` throws an error, to better match newer constructors added to JavaScript and Intl.

The order of arguments passed to MessageFormat have changed.

Updated supportedLocalesOf to be the union of supportedLocalesOf functions on Intl.NumberFormat, Intl.DateTimeFormat, and Intl.PluralRules.

**New Feature**
Custom placeholder types can be supported by passing in a new argument with formatter functions.

## 5.2.1

Updated CLDR plural rules.

## 5.0.0

This only updated the dependencies and bumped the version to match related
libraries.

* **Breaking Change**
  * The fallback for missing Intl was removed from `format-message-interpret`.

## 2.0.0

* **Spec Compliancy**
  * `supportedLocalesOf` now matches the behavior of Intl.* apis
  * `format` is defined as a getter for a function, just like other Intl.* apis
  * Update to CLDR 28
  * Removed `escape` option allowing for backslash escaping
* **Breaking Change**
  * Can no longer get the full list of supported locales via supportedLocalesOf
  * Parameter order has been reversed, so `locales` is first, just like Intl.* apis
  * Removed `cache` option
  * Removed parser and printer apis, refer instead to `format-message-parse` and `format-message-print`

## 1.2.1

* **Internal**
  * Update metadata for new github org
  * Update dependencies

## 1.2.0

* **Spec Compliancy**
  * Update to CLDR 27 (adds 'as' and 'ce' locales)

## 1.1.0

* **Bug Fix**
  * Fallback to toLocaleString methods when Intl is unavailable
* **Polish**
  * Better test error conditions
* **Internal**
  * Use [JS Standard Style](https://github.com/feross/standard)
* **Documentation**
  * Document fallback behavior
  * Include a plug for `format-message`

## 1.0.0

* **Polish**
  * Provide `index.js` for platforms that don't read package.json for main.
  * Provide `message-format/parser` for access to parser.
  * Provide `message-format/printer` for access to printer.
* **Documentation**
  * Document parser and printer high-level api.
* **Internal**
  * Refactor error handling in parser.
  * Use `lib` folder instead of `dist` for built files.

## 0.1.0

* **New Feature**
  * Added support for `selectordinal`.
  * Added pretty printer module `message-format/dist/printer`.
  * Added browser minified version with global `Intl.MessageFormat` at
    `dist/browser.js`.
* **Bug Fix**
  * Fix bad caching in interpreter.
  * Format unsupported rbnf types as `number`.
* **Internal**
  * Upgrade from `6to5` to `babel`.
  * Use `eslint` and `jscs` for style checking.
