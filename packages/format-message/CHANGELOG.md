# Changelog

## 6.2.0

Add TypeScript type definitions.

## 6.0.3

Use `var` declarations for wider compatibility.

## 6.0.0

**Breaking Change**
`formatChildren` is deprecated, since it can easily be confused by parameters that look like tags. Use the new `formatMessage.rich` function instead.

**New Feature**
`setup()` can now receive a `types` property with custom placeholder type formatters.

`formatMessage.rich(pattern, args [, locale ])` takes a pattern including simple (no attributes) html-like tags as placeholders.
```js
formatMessage.rich('Click <a>here</a>!', {
  a: ({ children }) => <Link>{children}</Link>
})
```
Self-closing tags can be used for rich elements that have no child content:
```js
formatMessage.rich('Please enter values for field marked with <icon/>.', {
  icon: () => <Icon />
})
```
And if you don't need a function to generate the rich value, you can pass it directly.
```js
formatMessage.rich('Please enter values for field marked with <icon/>.', {
  icon: <Icon />
})
```
Or even use a normal placeholder.
```js
formatMessage.rich('Please enter values for field marked with {icon}.', {
  icon: <Icon />
})
```


## 5.2.6

Fix IE11 compat by removing template literals.
Test against Inferno v5.

## 5.2.5

Made formatChildren more lenient in parsing.

## 5.2.3

Support inferno v4.

## 5.2.1

Updated CLDR plural rules.

## 5.2.0

Allow non-numeric tag names in messages for `formatChildren`.

## 5.1.0

Added `namespace` function to create a namespaced formatMessage.

## 5.0.0

* **New Feature**
  * `setup()` returns the current settings
  * Added localization helpers to public api
    * `number (value [, style [, locale ]])`
    * `date (value [, style [, locale ]])`
    * `time (value [, style [, locale ]])`
    * `select (value, options)`
    * `plural (value [, offset ], options [, locale ])`
    * `selectordinal (value [, offset ], options [, locale ])`
  * Allow `missingReplacement` to be a function
  * Added format-message/react module
* **Breaking Change**
  * format-message relies on Intl APIs for date an number formatting, if using in an environment without that API, you will need to use the Intl.js polyfill.

## 4.0.0

* **New Feature**
  * Added id and description by passing an object instead of a string
* **Breaking Change**
  * Reworked cli and moved it to format-message-cli
  * Removed cache option

## 3.2.0

* **New Feature**
  * Added `formats` option to `setup()`
* **Bug Fix**
  * Default `missingTranslation` to `"warning"`
* **Documentation**
  * Add `missingTranslation` and `missingReplacement` to README

## 3.1.0

* **New Feature**
  * Added `--no-instructions` option to suppress instructions in extract output
  * Added `--yml` option to output extract result as YAML instead of JSON
* **Bug Fix**
  * Made `lint` and `extract` tools work with ES6/7 files

## 3.0.1

* **Bug Fix**
  * Remove some lingering ES6 breaking ES5 environments

## 3.0.0

* **Internal**
  * Moved core functionality to new repo for better sharing
  * Move source to ES5 instead of transpiling ES6 source

## 2.5.1

* **Internal**
  * Update metadata for new github org
  * Update dependencies

## 2.5.0

* **New Feature**
  * Added instructions for translators to extracted json.
  * Sort keys lexically in extracted json.
  * Added support for missing translation options in runtime.
* **Internal**
  * Updated dependencies.

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
