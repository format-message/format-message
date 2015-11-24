# Changelog

## 4.0.1

* **Bug Fix**
  * fixed compatibility with ESLint 1.10
  * fixed variables declared without initializer, later called as functions causing error

## 4.0.0

* **Breaking Change**
  * `keyType` was renamed `generateId` to match new format-message
* **New Feature**
  * supports messages as an object with `id`, `default`, and `description`

## 0.3.0

* **Breaking Change**
  * all error messages have been shortened
  * translations has been broken into several rules
  * options for translations moved to `settings`
* **New Feature**
  * configure each rule for translations individually

## 0.2.0

* **Breaking Change**
  * change messages for translations issues
* **New Feature**
  * disallow extra and missing parameters in translated patterns

## 0.1.2

* **New Feature**
  * allow top-level translations to be a file path

## 0.1.1

* **Bug Fixes**
  * update format-message-core to fix bad # parameter warnings

## 0.1.0

* **New Feature**
  * eslint rules covering format-message lint
