# Changelog

## 6.0.0

**Breaking Change**
The order of arguments passed to interpret has been changed.

Placeholder ids absent from the arguments will no longer throw an error. You will instead see `'undefined'` in the final message. If you were relying on the error for validation, please use the lint rules instead.

**New Feature**
Styles for `number` placeholders can now be an LDML pattern string like `"#,##0.00 GBP"`. These are converted to options passed to `Intl.NumberFormat`, so grouping placement, scientific notation, and extra characters are mostly ignored.

Styles for `date` and `time` placeholders can now be a pattern string like `"MM/dd/yy"`. These are converted to options passed to `Intl.DateTimeFormat`, so extra characters (like `/` or `-`) are mostly ignored.

`interpret` now allows custom placeholder types.

Added `interpret.toParts` to get a flattened array of message parts. Parts are not coerced to strings, so this can help with rich formatting.
```js
interpret.toParts('en', parse('a {b} c'))({ b: 1 }) // [ 'a ', 1, ' c' ]
```

**Polish**
Better code reuse internally, `let` and `const` declarations instead of `var`.
Uses flow type comments to help prevent some kinds of issues.
