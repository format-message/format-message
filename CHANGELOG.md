# Changelog

> **Tags:**
> - [New Feature]
> - [Bug Fix]
> - [Spec Compliancy]
> - [Breaking Change]
> - [Documentation]
> - [Internal]
> - [Polish]

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

