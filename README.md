# message-format-inline

Write default messages inline. Optionally transpile translations.

[![npm Version][npm-image]][npm]
[![Dependency Status][deps-image]][deps]
[![Build Status][build-image]][build]

This is still a work in progress. Here be dragons.


Quick Start
-----------

`npm install message-format-inline --save` adds the library to `node_modules`. You can
then use it as follows:

```js
var format = require('message-format-inline');

var message = format('Hello { place }!', { place:'World' });
```

Your source code does not need to be transpiled in order to work properly, so
you can use `format` in server-side code, and transpile your source for better
performance in repeated use on the client.

message-format-inline relies on `Intl.NumberFormat` and `Intl.DateTimeFormat`
for formatting `number`, `date`, and `time` arguments. If you are in an
environment missing these (like node <= 0.12, IE < 11, or Safari) you'll
need to use a [polyfill][intl].


Overview
--------

The [ICU Message Format][icu-message] is a great format for user-visible
strings, and includes simple placeholders, number and date placeholders, and
selecting among submessages for gender and plural arguments. The format is
used in apis in [C++][icu-cpp], [PHP][icu-php], and [Java][icu-java].

message-format-inline provides a way to write your default (often English)
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

message-format-inline supports plurals for all CLDR languages. Locale-aware
formatting of number, date, and time are delegated to the `Intl` objects,
and select is the same across all locales. You don't need to load any extra
files for particular locales for message-format-inline.


API
---

### `format`

```js
var format = require('message-format-inline')
// or
import format from 'message-format-inline'

format(pattern[, args[, locales]])
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

### `format.setup`

```js
format.setup(options)
```

Configure `format` behavior for subsequent calls. This should be called before
any code that uses `format`.

Parameters

- `options` is an object containing the following config values:
    - `cache` is whether message, number, and date formatters are cached. Defaults to `true`
    - `locale` is the default locale to use when no locale is passed to `format`. Defaults to `"en"`.
    - `translate(pattern, locales)` is a function to translate messages. It should return the pattern translated for the specified locale.
        - `pattern` is the message pattern to translate.
        - `locale` is a string with a BCP 47 language tag, or an array of such strings.

### internal apis

`format.number`, `format.date`, and `format.time` are used internally and are
not intended for external use. Because these appear in the transpiled code,
transpiling does not remove the need to properly define `format` through
`require` or `import`.


Example Messages
--------

The examples provide sample transpiler output. This output is not meant to be
100% exact, but to give a general idea of what the transpiler does.

### Simple messages with no placeholders

```js
format('My Collections')

// transpiles to translated literal
"Minhas Coleções"
```

### Simple string placeholders

```js
format('Welcome, {name}!', { name:'Bob' });

// non-trivial messages transpile to self-invoking function
(function(locale, args) {
  return "Bem Vindo, " +
    args["name"] +
    "!";
})("pt-BR", { name:'Bob' });
```

### number, date, and time placeholders

```js
format('You took {n,number} pictures since {d,date} {d,time}', { n:4000, d:new Date() });
// en-US: "You took 4,000 pictures since Jan 1, 2015 9:33:04 AM"

format('{ n, number, percent }', { n:0.1 });
// en-US: "10%"

format('{ shorty, date, short }', { shorty:new Date() });
// en-US: "1/1/15"
```

### Complex string with select and plural in ES6

```js
import format from 'message-format-inline'

// using a template string for multiline, no interpolation
let format(`On { date, date, short } {name} ate {
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


License
-------

This software is free to use under the MIT license.
See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[npm]: https://www.npmjs.org/package/message-format-inline
[npm-image]: https://img.shields.io/npm/v/message-format-inline.svg
[deps]: https://david-dm.org/thetalecrafter/message-format-inline
[deps-image]: https://img.shields.io/david/thetalecrafter/message-format-inline.svg
[build]: https://travis-ci.org/thetalecrafter/message-format-inline
[build-image]: https://img.shields.io/travis/thetalecrafter/message-format-inline.svg
[icu-message]: http://userguide.icu-project.org/formatparse/messages
[icu-cpp]: http://icu-project.org/apiref/icu4c/classicu_1_1MessageFormat.html
[icu-php]: http://php.net/manual/en/class.messageformatter.php
[icu-java]: http://icu-project.org/apiref/icu4j/
[intl]: https://github.com/andyearnshaw/Intl.js
[message-format]: https://github.com/thetalecrafter/message-format
[recast]: https://github.com/benjamn/recast
[LICENSE]: https://github.com/thetalecrafter/message-format-inline/blob/master/LICENSE-MIT

