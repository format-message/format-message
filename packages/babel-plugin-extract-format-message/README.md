# babel-plugin-extract-format-message

> Extract messages from formatMessage calls

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


## Installation

```sh
$ npm install babel-plugin-extract-format-message
```


## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": [ "extract-format-message", {
    "generateId": "underscored_crc32",
    "outFile": "locales/en.json"
  } ]
}
```

### Via CLI

```sh
$ babel --plugins extract-format-message script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: [
    [ "extract-format-message", {
      "generateId": "underscored_crc32",
      "outFile": "locales/en-US/messages.yml",
      "locale": "en-US"
    } ]
  ]
})
```

### Options

* `generateId` is either a function `string -> string`, or one of `"literal"`, `"normalized"`, `"underscored"`, `"underscored_crc32"`. Defaults to `"underscored_crc32"`
* `outFile` is a path (relative to cwd) to the output file containing extracted messages. Defaults to stdout.
* `format` is a string specifying the target file format. By default the format is inferred from the file extension of `outFile`.
* `locale` is the BCP 47 Language Tag string specifying the language of the default messages. This is only used in the `yaml` format, to match the Rails conventions. Defaults to `"en"`.

### Formats

#### json

The structure of the file matches the conventions of Chrome's i18n tools. This is also the default format used if an unrecognized format is specified.

Note that format-message apis expecting all of the translations requires a higher level object with locale keys. The value for each locale matches this format.

```json
{
  "hello_67b127a": {
    "message": "Hello!",
    "description": "Greeting shown on the home page."
  }
}
```

#### js

Aliases: `javascript`, `commonjs`, `node`

Uses the same structure as `json`, but uses Node.js's `module.exports` idiom to export the messages.

```js
module.exports = {
  "hello_67b127a": {
    "message": "Hello!",
    "description": "Greeting shown on the home page."
  }
}
```

#### es6

Uses the same structure as `json`, but uses ES6 module syntax to export the messages.

```javascript
export default {
  "hello_67b127a": {
    "message": "Hello!",
    "description": "Greeting shown on the home page."
  }
}
```

#### yaml

Aliases: `yml`, `rails`

Follows the Ruby on Rails i18n conventions for internationalization messages. Descriptions are added as a comment above the messages they describe.

Note that unlike the other formats, `yaml` requires the `locale` to be at the top level.

```yaml
en:
  # Greeting shown on the home page.
  hello_67b127a: Hello!
```


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[npm]: https://www.npmjs.org/package/babel-plugin-extract-format-message
[npm-image]: https://img.shields.io/npm/v/babel-plugin-extract-format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
