# Changelog

## 6.2.0

Add TypeScript type definitions.

## 6.0.3

Use `var` declarations for wider compatibility.

## 6.0.0

**Breaking Change**
You can no longer `require('format-message-parse/tokens')`. Instead, you can pass an empty array in the options argument to `parse(pattern, { tokens })`. Even when the method throws, the tokens array will have been filled with all found tokens prior to the bad syntax. Token types have also changed.

Validation of placeholder types is much looser, so additional validation of the type (is there a builtin or custom formatter for it?), as well as validation of sub-message keywords (does this locale have a "two" plural rule?) is recommended after parsing.

**New Feature**
`parse` now allows any argument type within a placeholder, as long as the name does not include any syntax characters (`{},#'`) or whitespace. This is to support custom placeholder types that are set up with the interpreter.

`parse` now handles very simple xml/html-like tags to support rich formatting.

**Polish**
Better code reuse internally, `let` and `const` declarations instead of `var`.

## 5.0.0

This has been versioned only to match versions with related libraries. There are
no changes to the functionality.

## 4.1.0

* **New Feature**
  * Add format-message-parse/tokens to get a list of tokens in a message
  * tokens still returns a partial list when an error is encountered
* **Bug Fix**
  * Improve whitespace character check
