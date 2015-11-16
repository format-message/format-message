# babel-plugin-transform-format-message

> Pre-generate ids from default messages or inline a single language translation

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


## Installation

```sh
$ npm install babel-plugin-transform-format-message
```


## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": [ "transform-format-message", {
    "generateId": "underscored_crc32",
    "inline": false
  } ]
}
```

### Via CLI

```sh
$ babel --plugins transform-format-message script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: [
    [ "transform-format-message", {
      "generateId": "underscored_crc32",
      "translations": "./locales",
      "locale": "pt-BR"
    } ]
  ]
})
```

### Options

* `generateId` is either a function `string -> string`, or one of `"literal"`, `"normalized"`, `"underscored"`, `"underscored_crc32"`. Default is `"underscored_crc32"`.
* `inline` is a boolean. If true, the full translated message will be inlined and optimized, otherwise only generated ids will be added. Default is `false`.
* `locale` is the BCP 47 Language Tag string specifying the target language to inline. This is only used with `inline: true`. Default is `"en"`.
* `translations` is an object of the form: `{ [locale]: { [id]: { message: '...' }, ... } }`. This is an object with keys for each locale, with values matching the `extract-format-message` json output. This can also be a string path to require a module that exports a matching object.
* `missingTranslation` is one of `"ignore"`, `"warning"`, `"error"`. Default is `"warning"`.
* `missingReplacement` is an optional string to use in place of missing translations. By default the default message will be used.


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[npm]: https://www.npmjs.org/package/babel-plugin-transform-format-message
[npm-image]: https://img.shields.io/npm/v/babel-plugin-transform-format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
