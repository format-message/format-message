# Changelog

> **Tags:**
> - [New Feature]
> - [Bug Fix]
> - [Spec Compliancy]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]

## 2.4.1

* **Bug Fix**
  * Babel seems to resolve some source map issues. `¯\_(ツ)_/¯`
* **Internal**
  * Use babel instead of recast for parsing and traversing.

## 2.4.0

* **New Feature**
  * `formatMessage.translate` gets the locale-specific pattern.

## 2.3.0

* **New Feature**
  * `format-message lint` reports errors when required parameters are missing.
  * `format-meassge inline` added `--missing-translation` and `--missing-replacement`.
* **Bug Fix**
  * Ensure `formatMessage` is in scope inside transpiled function declarations.
* **Polish**
  * Lots of code cleanup, split linter and extractor out of inliner.
  * Convert more cases to inline concat instead of a function call.
* **Documentation**
  * Added a logo image.
  * Reformat long paragraphs to single line.
  * Add more detail to transpilation results.
* **Internal**
  * Made test timeouts more forgiving for slow ci environments.

## 2.2.0

* **Spec Compliancy**
  * Update to CLDR 27 (adds 'as' and 'ce' locales)

## 2.1.1

* **Bug Fix**
  * Parse error in source code triggers a helpful message and continues instead of dying.

## 2.1.0

* **New Feature**
  * Auto detect function name based on `require` and `import`.
* **Internal**
  * Update dependencies.
  * Follow [JS Standard Style](https://github.com/feross/standard).
  * Make test timeouts more lenient because Karma is slow.
* **Documentation**
  * Document auto detecting function name.
  * Update contributing guide to link to JS Standard Style.

## 2.0.0

* **Breaking Change**
  * Rename package to `format-message`.
  * Rename bin to `format-message`.
  * Rename default function-name to `formatMessage`.

## 1.0.4

* **Bug Fix**
  * Use caret version for glob since they delete old versions breaking npm install.
* **Internal**
  * Updated dependencies.

## 1.0.3

* **Polish**
  * Reduce duplication in replaced calls.
  * Reduce probability of collisions when inlining multiple files.

## 1.0.2

* **Internal**
  * Updated dependencies.
  * Moved built files from `dist` to `lib`.
  * Added `index.js` for platforms that don't lookup package.json main.

## 1.0.1

* **Documentation**
  * Removed dragons.

## 1.0.0

* **New Feature**
  * Added `message-format lint` cli tool.
  * Added `message-format extract` cli tool.
  * Added `message-format inline` cli tool.
* **Breaking Change**
  * Removed `message-format-inline` cli tool.
  * Removed `message-format-scrape` cli tool.
  * Renamed `formatName` option to `functionName` in `Inliner`.
* **Bug Fix**
  * Correctly load target locale plural rules when inlining.
* **Documentation**
  * Added CLI documentation.
* **Internal**
  * Switch from jasmine to mocha.
  * Add test for inlined format.

## 0.2.0

* **New Feature**
  * Added `message-format-scrape` script.
  * Allow `sourceMapName` option in `inline`.

## 0.1.0

* **New Feature**
  * Added support for `selectordinal`.
* **Bug Fix**
  * Format unsupported rbnf types as `number`.
* **Internal**
  * Upgrade from `6to5` to `babel`.
  * Use `eslint` and `jscs` for style checking.
