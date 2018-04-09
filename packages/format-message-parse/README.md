# ![format-message-parse][logo]

> Parse ICU MessageFormat pattern strings to a compact ast

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]

Turns a ICU Message Format string:
```js
`You have {
  numBananas, plural,
     =0 {no bananas}
    one {a banana}
  other {# bananas}
} for sale`
```

into a compact format-message ast:
```js
[ "You have ", [ "numBananas", "plural", 0, {
     "=0": [ "no bananas" ],
    "one": [ "a banana" ],
  "other": [ [ '#' ], " bananas" ]
} ], " for sale." ]
```

Quick Examples
--------------

`npm install format-message-parse --save`

```js
import parse from 'format-message-parse'
import interpret from 'format-message-interpret'

interpret('en', parse('Hello, {name}!'))({ name: 'Jane' })
```

API
---

### `parse(pattern: string, tokens?: ?Token[]): AST`

Generate a compact array-based AST from an ICU MessageFormat string pattern. If an empty `tokens` array is passed in, it will be filled with found tokens.

This can throw a `SyntaxError` if the pattern is not valid. The `offset` property of the error lets you know how far into the pattern tokenization was able to go before the error. The `tokens` array will have all the found tokens up until the bad syntax.

Note that the only semantic validation done in parsing is ensuring that `select`, `selectordinal`, and `plural` include an `other` sub-message. It does *not* validate that a plural keyword applies to the locale, or that a style is supported by the type, or even that the type will be supported by the interpreter. Successful parsing is not a guarantee the final message will format as expected.

### `SyntaxError`

```ts
class SyntaxError extends Error {
  name: 'SyntaxError';
  message: string;
  expected: ?string;
  found: ?string;
  offset: number;
  line: number;
  column: number;
}
```


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/2febdd8/logo.svg
[npm]: https://www.npmjs.org/package/format-message-parse
[npm-image]: https://img.shields.io/npm/v/format-message-parse.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
