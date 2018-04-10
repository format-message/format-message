# Changelog

## 6.0.0

**Breaking Change**
Placeholder ids absent from the arguments will no longer throw an error. You will instead see `'undefined'` in the final message. If you were relying on the error for validation, please use the lint rules instead.

**New Feature**
`interpret` now allows custom placeholder types.

Added `interpret.toParts` to get a flattened array of message parts. Parts are not coerced to strings, so this can help with rich formatting.
```js
interpret.toParts('en', parse('a {b} c'))({ b: 1 }) // [ 'a ', 1, ' c' ]
```

**Polish**
Better code reuse internally, `let` and `const` declarations instead of `var`.
Uses flow type comments to help prevent some kinds of issues.
