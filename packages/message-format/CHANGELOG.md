# Changelog

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
