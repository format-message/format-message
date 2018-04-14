# ![format-message-interpret][logo]

> Convert format-message-parse ast to a function

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

into a function:
```js
format({ numBananas:0 })
//-> "You have no bananas for sale."
```

Quick Examples
--------------

`npm install format-message-interpret --save`

```js
import parse from 'format-message-parse'
import interpret from 'format-message-interpret'

interpret('en', parse('Hello, {name}!'))({ name: 'Jane' })
```

API
---

### `interpret(locales: string | string[], ast: AST, types?: Types)`

Generate a function from an `ast`, using the formatting rules of the `locales` that accepts an arguments object, and returns a string. You can optionally pass custom `types`. Any non-standard type found in `ast` without a corresponding formatter in `types` will be treated as a simple string type.

```js
type Types = {
  [type: string]: (placeholder: string[], locales: string | string[]) =>
    (value: any, args: Object) => string
}
```

`types` is an object with each key being the name of the type as it appears in the message pattern. Each value is a function that takes the `locales`, and the `node` from the ast (like `[ 'a', 'mytype', 'style' ]`), and it returns a function that will be called with the specific `value`, and the complete arguments object. If the custom type was defined with sub-messages, those will already be converted to functions meant to be called with `args`.

### `interpret.toParts(locales: string | string[], ast: AST, types?: Types)`

Like, `interpret`, `interpretToParts` will generate a function accepting the message arguments. However, it will return an array of message parts, instead of a string. This is intended to help generate rich messages.

```js
interpret.toParts('en', parse('a {b} c'))({ b: 1 }) // [ 'a ', 1, ' c' ]
interpret.toParts('en', parse('Click {a, element, children {here}}'), {
  element: (locales, [ id, type, props ]) =>
    (fn, args) => fn(props.children(args))
})({ a: children => <a>{children}</a> })
// [ 'Click ', <a>here</a> ]
```

License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/2febdd8/logo.svg
[npm]: https://www.npmjs.org/package/format-message-interpret
[npm-image]: https://img.shields.io/npm/v/format-message-interpret.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
