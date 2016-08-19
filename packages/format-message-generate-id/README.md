# ![format-message-generate-id][logo]

> Generate a message id from the default message pattern

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]

A small collection of helper functions for use in format-message, to generate a message id based on the default message pattern.

Quick Examples
--------------

`npm install format-message-generate-id --save`

```js
var formatMessage = require('format-message');
formatMessage.setup({
  generateId: require('format-message-generate-id/underscored_crc32')
});
```

```js
import formatMessage from 'format-message'
import generate from 'format-message-generate-id'

formatMessage.setup({
  generateId: generate.normalized
})
```

API
---

### `literal(pattern)`

Simply returns the pattern passed in.

### `normalized(pattern)`

Normalizes insignificant whitespace within ICU placeholder syntax. This requires parsing and pretty-printing the message pattern, and an invalid message will cause an error to be thrown.

### `underscored(pattern)`

After normalizing the message pattern, a slug is generated with underscores replacing symbols and whitespace.

### `underscored_crc32(pattern)`

In addition to generating a slug, a crc32 checksum is calculated from the normalized pattern and appended to the result.

License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/2febdd8/logo.svg
[npm]: https://www.npmjs.org/package/format-message-generate-id
[npm-image]: https://img.shields.io/npm/v/format-message-generate-id.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
