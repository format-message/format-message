# message-format

> Intl.MessageFormat prollyfill supporting ICU message format

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]


Quick Start
-----------

`npm install message-format --save` adds the library to `node_modules`. You can
then use it as follows:

```js
var MessageFormat = require('message-format');

var message = new MessageFormat('Hello { place }!','en-US',);
var formatted = message.format({ place:'World' });
```

The library works great with tools like browserify and webpack for use in
front-end code. Also check out [format-message][format-message] for an
alternative API and inlining translations at build time.

Note: message-format relies on `Intl.NumberFormat` and `Intl.DateTimeFormat`
for formatting `number`, `date`, and `time` arguments. If you are in an
environment missing these (like node <= 0.12, IE < 11, or Safari < 10) you'll
need to use a [polyfill][intl]. If `Intl` formats are missing, an error occurs
when formatting these arguments.


Overview
--------

The [ICU Message Format][icu-message] is a great format for user-visible
strings, and includes simple placeholders, number and date placeholders, and
selecting among submessages for gender and plural arguments. The format is
used in apis in [C++][icu-cpp], [PHP][icu-php], and [Java][icu-java].

message-format is intended as a polyfill for the yet to be standardized
`Intl.MessageFormat` api. Since there is only a [strawman proposal][proposal]
at this point, this library represents only one possible way the standard api
could eventually work, hence "prollyfill".

### Loading locale data

message-format supports plural rules for all CLDR languages. Locale-aware
formatting of number, date, and time are delegated to the `Intl` objects,
and select is the same across all locales. You don't need to load any extra
files for particular locales for message-format.

### Supported ICU Formats

* `number` - `percent`, `currency`
* `date` - `short`, `medium`, `long`, `full`
* `time` - `short`, `medium`, `long`, `full`
* `plural`
* `selectordinal`
* `select`

### Unsupported ICU Formats

`ordinal`, `duration`, and `spellout` arguments are supported by the parser,
but just act like `number`. These are not supported by `Intl.NumberFormat`.
They require a lot of language-specific code, and would make the library
undesireably large. For now, if you need these kinds of formats, you can pass
them into the message pre-formatted, and refence them in the message pattern
with a simple string placeholder (`{ arg }`).


API
---

### `MessageFormat`

```js
var MessageFormat = require('message-format')
// or
import MessageFormat from 'message-format'

new MessageFormat(locales, pattern)
```

Construct a message format object

Parameters

- `locales` is a string with a BCP 47 language tag, or an array of such strings.
- `pattern` is a properly formatted ICU Message Format pattern. A poorly formatted pattern will cause an `Error` to be thrown.

### `MessageFormat` instances

```js
message.format([args])
```

Format the message with the given arguments

Parameters

- `args` is an object containing the values to replace placeholders with. Required if the pattern contains placeholders.


Examples
--------

### Simple string placeholders

```js
var message = new MessageFormat('en', 'Welcome back, {name}!');
message.format({ name:'Bob' }); // "Welcome back, Bob!"
message.format({ name:'Bill' }); // "Welcome back, Bill!"
```

### Quote escaping rules

Escaping is a little weird in ICU Message Format.

1. `''` is always `'`
2. `'` begins an escaped string only if followed immediately by a syntax char (`{}#`)
3. `'` ends an escaped string, unless it is doubled. See #1

The recommendation from ICU is to use the ASCII apostrophe (`'` U+0027) only
for escaping syntax characters, and use the pretty single quote (`’` U+2019)
for actual apostrophes and single quotes in a message pattern.

```js
var message = new MessageFormat('en', 'This isn\'\'t a \'{simple}\' \'string\'');
message.format(); // "This isn't a {simple} 'string'"

// double quotes or backticks (ES6) make it a little easier to read
message = new MessageFormat("en", "This isn''t a '{simple}' 'string'");
message.format(); // "This isn't a {simple} 'string'"
```

### number, date, and time placeholders

```js
var message = new MessageFormat('en', 'You took {n,number} pictures since {d,date} {d,time}');
message.format({ n:4000, d:new Date() }); // "You took 4,000 pictures since Jan 1, 2015 9:33:04 AM"

message = new MessageFormat('en', '{ n, number, percent }');
message.format({ n:0.1 }); // "10%"

message = new MessageFormat('en', '{ shorty, date, short }');
message.format({ shorty:new Date() }); // "1/1/15"
```

### selectordinal

```js
var message = new MessageFormat('en', '{ n, selectordinal,\
  one {#st}\
  two {#nd}\
  few {#rd}\
  other {#th}\
} place')
message.format({ n:102 }) // "102nd place"
```

### Complex string with select and plural in ES6

```js
import MessageFormat from 'message-format'

// using a template string for multiline, no interpolation
let message = new MessageFormat('en', `On { date, date, short } {name} ate {
  numBananas, plural,
       =0 {no bananas}
       =1 {a banana}
    other {# bananas}
  } {
  gender, select,
      male {at his house.}
    female {at her house.}
     other {at their house.}
  }`)

message.format({
  date: new Date(),
  name: 'Curious George',
  gender: 'male',
  numBananas: 27
}) // "On 1/1/15 Curious George ate 27 bananas at his house."
```


License
-------

This software is free to use under the MIT license.
See the [LICENSE-MIT file][LICENSE] for license text and copyright information.

[npm]: https://www.npmjs.org/package/message-format
[npm-image]: https://img.shields.io/npm/v/message-format.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[format-message]: https://github.com/format-message/format-message
[icu-message]: http://userguide.icu-project.org/formatparse/messages
[icu-cpp]: http://icu-project.org/apiref/icu4c/classicu_1_1MessageFormat.html
[icu-php]: http://php.net/manual/en/class.messageformatter.php
[icu-java]: http://icu-project.org/apiref/icu4j/
[proposal]: http://wiki.ecmascript.org/doku.php?id=globalization:messageformatting
[intl]: https://github.com/andyearnshaw/Intl.js
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
