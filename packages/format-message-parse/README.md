# ![format-message-parse][logo]

> Parse ICU message strings to a compact ast

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

### `parse(pattern)`

Generate an ast from a string pattern


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
