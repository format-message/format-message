# format-message

Write default messages inline. Optionally transpile translations.

[![npm Version][npm-image]][npm]
[![Dependency Status][deps-image]][deps]
[![Build Status][build-image]][build]
[![JS Standard Style][style-image]][style]


Quick Start
-----------

`npm install format-message --save` adds the library to `node_modules`. You can
then use it as follows:

```js
var formatMessage = require('format-message');

var message = formatMessage('Hello { place }!', { place:'World' });
```

Your source code does not need to be transpiled in order to work properly, so
you can use `formatMessage` in server-side code, and transpile your source for better
performance in repeated use on the client.

format-message relies on `Intl.NumberFormat` and `Intl.DateTimeFormat`
for formatting `number`, `date`, and `time` arguments. If you are in an
environment missing these (like node <= 0.12, IE < 11, or Safari) you'll
need to use a [polyfill][intl].


Overview
--------

The [ICU Message Format][icu-message] is a great format for user-visible
strings, and includes simple placeholders, number and date placeholders, and
selecting among submessages for gender and plural arguments. The format is
used in apis in [C++][icu-cpp], [PHP][icu-php], and [Java][icu-java].

format-message provides a way to write your default (often English)
messages as literals in your source, and then scrape out the default patterns
and transpile your source with fast inline code for formatting the translated
message patterns.

This relies on [message-format][message-format] for parsing and formatting ICU
messages, and [recast][recast] for transpiling the source code.

### Supported ICU Formats

See [message-format][message-format] for supported ICU formats.

### Quoting escaping rules

See the [ICU site][icu-message] and [message-format][message-format] for
details on how to escape special characters in your messages.

### Loading locale data

format-message supports plurals for all CLDR languages. Locale-aware
formatting of number, date, and time are delegated to the `Intl` objects,
and select is the same across all locales. You don't need to load any extra
files for particular locales for format-message.


API
---

### `formatMessage`

```js
var formatMessage = require('format-message')
// or
import formatMessage from 'format-message'

formatMessage(pattern[, args[, locales]])
```

Translate and format the message with the given pattern and arguments.

Parameters

- `pattern` is a properly formatted ICU Message Format pattern. A poorly formatted pattern will cause an `Error` to be thrown.
    - The pattern is used as a key into the `translate` function you provide in configuration, and is also used as the fallback if no translation is returned, or `translate` has not been configured
    - If `pattern` is not a string literal, the function cannot be transpiled at build time.
- `args` is an object containing the values to replace placeholders with. Required if the pattern contains placeholders.
- `locales` is an optional string with a BCP 47 language tag, or an array of such strings.
    - The locales are also passed into the `translate` function and indicate the desired destination language.
    - If `locales` is not a string literal, the function cannot be transpiled at build time.

### `formatMessage.setup`

```js
formatMessage.setup(options)
```

Configure `formatMessage` behavior for subsequent calls. This should be called before
any code that uses `formatMessage`.

Parameters

- `options` is an object containing the following config values:
    - `cache` is whether message, number, and date formatters are cached. Defaults to `true`
    - `locale` is the default locale to use when no locale is passed to `formatMessage`. Defaults to `"en"`.
    - `translate(pattern, locales)` is a function to translate messages. It should return the pattern translated for the specified locale.
        - `pattern` is the message pattern to translate.
        - `locale` is a string with a BCP 47 language tag, or an array of such strings.

### internal apis

`formatMessage.number`, `formatMessage.date`, and `formatMessage.time` are used internally and are
not intended for external use. Because these appear in the transpiled code,
transpiling does not remove the need to properly define `formatMessage` through
`require` or `import`.


Example Messages
--------

The examples provide sample transpiler output. This output is not meant to be
100% exact, but to give a general idea of what the transpiler does.

### Simple messages with no placeholders

```js
formatMessage('My Collections')

// transpiles to translated literal
"Minhas Coleções"
```

### Simple string placeholders

```js
formatMessage('Welcome, {name}!', { name:'Bob' });

// non-trivial messages transpile to self-invoking function
(function(locale, args) {
  return "Bem Vindo, " +
    args["name"] +
    "!";
})("pt-BR", { name:'Bob' });
```

### number, date, and time placeholders

```js
formatMessage('You took {n,number} pictures since {d,date} {d,time}', { n:4000, d:new Date() });
// en-US: "You took 4,000 pictures since Jan 1, 2015 9:33:04 AM"

formatMessage('{ n, number, percent }', { n:0.1 });
// en-US: "10%"

formatMessage('{ shorty, date, short }', { shorty:new Date() });
// en-US: "1/1/15"
```

### Complex string with select and plural in ES6

```js
import formatMessage from 'format-message'

// using a template string for multiline, no interpolation
let formatMessage(`On { date, date, short } {name} ate {
  numBananas, plural,
       =0 {no bananas}
       =1 {a banana}
       =2 {a pair of bananas}
    other {# bananas}
  } {
  gender, select,
      male {at his house.}
    female {at her house.}
     other {at their house.}
  }`, {
  date: new Date(),
  name: 'Curious George',
  gender: 'male',
  numBananas: 27
})
// en-US: "On 1/1/15 Curious George ate 27 bananas at his house."
```


CLI Tools
---------

All of the command line tools will look for `require`ing or `import`ing
format-message in your source files to determine the local name of the
`formatMessage` function. Then they will either check for problems, extract
the original message patterns, or replace the call as follows:

### format-message lint

#### Usage: `format-message lint [options] [files...]`

find message patterns in files and verify there are no obvious problems

#### Options:

    -h, --help                  output usage information
    -n, --function-name [name]  find function calls with this name [formatMessage]
    --no-auto                   disables auto-detecting the function name from import or require calls
    -k, --key-type [type]       derived key from source pattern literal|normalized|underscored|underscored_crc32 [underscored_crc32]
    -t, --translations [path]   location of the JSON file with message translations, if specified, translations are also checked for errors
    -f, --filename [filename]   filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]

#### Examples:

lint the src js files, with `__` as the function name used instead of `formatMessage`

    format-message lint -n __ src/**/*.js

lint the src js files and translations

    format-message lint -t i18n/pt-BR.json src/**/*.js


### format-message extract

#### Usage: `format-message extract [options] [files...]`

find and list all message patterns in files

#### Options:

    -h, --help                  output usage information
    -n, --function-name [name]  find function calls with this name [formatMessage]
    --no-auto                   disables auto-detecting the function name from import or require calls
    -k, --key-type [type]       derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]
    -l, --locale [locale]       BCP 47 language tags specifying the source default locale [en]
    -o, --out-file [out]        write messages JSON object to this file instead of to stdout

#### Examples:

extract patterns from src js files, dump json to `stdout`. This can be helpful
to get familiar with how `--key-type` and `--locale` change the json output.

    format-message extract src/**/*.js

extract patterns from `stdin`, dump to file.

    someTranspiler src/*.js | format-message extract -o locales/en.json


### format-message inline

#### Usage: `format-message inline [options] [files...]`

find and replace message pattern calls in files with translations

#### Options:

    -h, --help                  output usage information
    -n, --function-name [name]  find function calls with this name [formatMessage]
    --no-auto                   disables auto-detecting the function name from import or require calls
    -k, --key-type [type]       derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]
    -l, --locale [locale]       BCP 47 language tags specifying the target locale [en]
    -t, --translations [path]   location of the JSON file with message translations
    -i, --source-maps-inline    append sourceMappingURL comment to bottom of code
    -s, --source-maps           save source map alongside the compiled code
    -f, --filename [filename]   filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]
    -o, --out-file [out]        compile all input files into a single file
    -d, --out-dir [out]         compile an input directory of modules into an output directory
    -r, --root [path]           remove root path for source filename in output directory [cwd]

#### Examples:

create locale-specific client bundles with source maps

    format-message inline src/**/*.js -s -l de -t translations.json -o dist/bundle.de.js
    format-message inline src/**/*.js -s -l en -t translations.json -o dist/bundle.en.js
    format-message inline src/**/*.js -s -l es -t translations.json -o dist/bundle.es.js
    format-message inline src/**/*.js -s -l pt -t translations.json -o dist/bundle.pt.js
    ...

inline without translating multiple files that used `var __ = require('format-message')`

    format-message inline -d dist -r src -n __ src/*.js lib/*.js component/**/*.js


License
-------

This software is free to use under the MIT license.
See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[npm]: https://www.npmjs.org/package/format-message
[npm-image]: https://img.shields.io/npm/v/format-message.svg
[deps]: https://david-dm.org/thetalecrafter/format-message
[deps-image]: https://img.shields.io/david/thetalecrafter/format-message.svg
[build]: https://travis-ci.org/thetalecrafter/format-message
[build-image]: https://img.shields.io/travis/thetalecrafter/format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[icu-message]: http://userguide.icu-project.org/formatparse/messages
[icu-cpp]: http://icu-project.org/apiref/icu4c/classicu_1_1MessageFormat.html
[icu-php]: http://php.net/manual/en/class.messageformatter.php
[icu-java]: http://icu-project.org/apiref/icu4j/
[intl]: https://github.com/andyearnshaw/Intl.js
[message-format]: https://github.com/thetalecrafter/message-format
[recast]: https://github.com/benjamn/recast
[LICENSE]: https://github.com/thetalecrafter/format-message/blob/master/LICENSE-MIT
