# ![format-message-print][logo]

> Pretty print compact message format ast

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


Turns a compact format-message ast:
```js
[ "You have ", [ "numBananas", "plural", 0, {
     "=0": [ "no bananas" ],
    "one": [ "a banana" ],
  "other": [ [ '#' ], " bananas" ]
} ], " for sale." ]
```

into a pretty ICU Message Format string:
```js
`You have {
  numBananas, plural,
     =0 {no bananas}
    one {a banana}
  other {# bananas}
} for sale`
```


Quick Examples
--------------

`npm install format-message-print --save`

```js
import parse from 'format-message-parse'
import print from 'format-message-print'

print(parse('Hello, {name}!'))
//-> 'Hello { name }!'
```

API
---

### `print(pattern)`

Generate a string from an ast. The output is a canonical version of the pattern.


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/2febdd8/logo.svg
[npm]: https://www.npmjs.org/package/format-message-print
[npm-image]: https://img.shields.io/npm/v/format-message-print.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
