# ![format-message][logo]

> Internationalize text, numbers, and dates using ICU Message Format

[![npm Version][npm-image]][npm]
[![Build Status][build-image]][build]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


Quick Examples
--------------

`npm install format-message --save`

By default, the passed in string is parsed and formatted.

```js
var formatMessage = require('format-message')
var message = formatMessage('Hello { place }!', { place: 'World' })
```

You can pass an object to provide more information about a message.

```js
import formatMessage from 'format-message'

let message = formatMessage({
  id: 'welcome_name', // optional, can be generated from `default`
  default: 'Welcome, {name}!',
  // optional description gives translators more context
  description: 'Greeting at the top of the home page, showing the current user’s preferred name'
}, {
  name: user.preferredName
})
```

Configure format-message to use translations, infer missing ids from the default message, report and replace missing translations, and add custom placeholder style formats.

```js
formatMessage.setup({
  locale: 'es-ES', // what locale strings should be displayed
  translations: require('./locales'), // object containing translations
  generateId: require('format-message-generate-id/underscored_crc32'), // function to generate a missing id from the default message
  missingReplacement: '!!NOT TRANSLATED!!', // use this when a translation is missing instead of the default message
  missingTranslation: 'ignore', // don't console.warn or throw an error when a translation is missing
  formats: {
    number: { // add '{ amount, number, EUR }' format
      EUR: { style: 'currency', currency: 'EUR' }
    },
    date: { // add '{ day, date, weekday }' format
      weekday: { weekday: 'long' }
    }
  }
})
```

Formatting `number`, `date`, and `time` arguments relies on the ECMAScript Internationalization API (`Intl`). If you are in an environment missing this API ([like node <= 0.12, IE < 11, or Safari < 10][caniuse-intl]) you'll want to use a [polyfill][intl]. Otherwise an error will be thrown when trying to format these arguments.


Format Overview
---------------

The [ICU Message Format][icu-message] is a great format for user-visible strings, and includes simple placeholders, number and date placeholders, and selecting among submessages for gender and plural arguments. The format is used in apis in [C++][icu-cpp], [PHP][icu-php], and [Java][icu-java]. There is a [guide for translators][icu-for-translators] you can send to your translators, and it's a nice primer for developers as well.

`format-message` provides a way to write your default (often English) message patterns as literals in your source, and then lookup translations at runtime. There are also tools to lint, extract, and inline translations.

This relies on [message-format][message-format] for parsing and formatting ICU messages.

### Supported ICU Formats

See [message-format][message-format] for supported ICU formats.

### Quoting escaping rules

See the [ICU site][icu-message] and [message-format][message-format] for details on how to escape special characters in your messages.

### Loading locale data

`format-message` supports plurals for all CLDR languages. Locale-aware formatting of number, date, and time are delegated to the `Intl` apis, and select is the same across all locales. You don't need to load any extra files for particular locales for `format-message` itself.


API
---

### `formatMessage(pattern[, args[, locales]])`

Translate and format the message with the given pattern and arguments. Literal arguments for `pattern` and `locales` are recommended so you can take advantage of linting, extraction, and inlining tools.

Parameters

- `pattern` is a string or object describing the message. A string value is equivalent to `{ default: value }`.
  - `default` is a properly formatted ICU Message Format pattern. A poorly formatted pattern will cause an `Error` to be thrown.
    - This will be used directly if no translations are conifgured or if the translation is missing and no `missingReplacement` is configured.
    - This is also used to generate an inferred `id`, if none is explicitly included.
  - `id` is a string identifier for the message. This is used as a key to look up the translation from the configured `translations`. If none is specified, one is generated from the `default` pattern.
  - `description` is a string providing additional context for this message. This has no runtime effect, but can be extracted along with the default message to be sent to translators.
- `args` is an object containing the values to replace placeholders with. Required if the pattern contains placeholders.
- `locales` is an optional string with a BCP 47 language tag, or an array of such strings.
  - When specified, format-message will attempt to look up the translation for each language until one is found.
  - When omitted the locale configured in `setup()` is used instead.

### `formatMessage.rich(pattern[, args[, locales]])`

Translate and format the message with the given pattern and arguments and return an array of message parts. If the pattern contains any html-like tags (`<a>go</a>`, `<icon/>`, etc.) they are interpreted as placeholders expecting a function that will receive the children message parts as an array. Attributes are not supported for the placeholder tags and will throw a parse error.

Note that for React, and perhaps other libraries as well, elements in an array should have a `key` specified, or you will trigger warnings.

```jsx
formatMessage.rich("Click <a>here<a/>", {
  a: ({ children }) => <Link key="a">{children}</Link>
})
// returns [ "Click ", <Link key="a">here</Link> ]
```

Parameters

  The same as `formatMessage(pattern[, args[, locales]])`.

### `formatMessage.setup(options)`

Configure `formatMessage` behavior for subsequent calls. This should be called before any code that uses `formatMessage`. Returns an object containing the current options.

Parameters

- `options` is an object containing the following config values:
  - `locale` is the default locale to use when no locale is passed to `formatMessage`. Defaults to `"en"`.
  - `translations` is an object with locales as properties, each value is an object with message ids as properties. The value for each message id property is either the translated message pattern string, or an object with the `message` property containing the translated message pattern string.
  - `generateId(defaultPattern)` is a function to generate an id from the default message pattern.
    - `defaultPattern` is the default message pattern.
    - This function must return a string id.
    - The [`format-message-generate-id`][format-message-generate-id] module has a few functions you can use if you don't want to use your own.
  - `missingReplacement` is a string or function that returns a string that will be used when a message translation isn't found. If a function, it will be called with `(pattern, id, locale)` parameters to get the replacement. If null or not specified, then the default message is used.
  - `missingTranslation` is one of `"ignore"`, `"warning"`, `"error"`. By default it is `"warning"`, and missing translations cause a console warning. If `"error"`, an error is thrown.
  - `formats` is an object containing objects that define placeholder styles `{ name, type, style }`:
    - `number` is an object containing number format styles to add. Each property name can be used afterwards as a style name for a number placeholder. The value of each property is an object that will be passed to an [`Intl.NumberFormat`][mdn-intl-numberformat] constructor as the second argument.
    - `date` is an object containing date format styles to add. Each property name can be used afterwards as a style name for a date placeholder. The value of each property is an object that will be passed to an [`Intl.DateTimeFormat`][mdn-intl-datetimeformat] constructor as the second argument.
    - `time` is an object containing time format styles to add. Each property name can be used afterwards as a style name for a time placeholder. The value of each property is an object that will be passed to an [`Intl.DateTimeFormat`][mdn-intl-datetimeformat] constructor as the second argument.

### `formatMessage.namespace()`

Return a new instance of `formatMessage` with isolated configuration. Calls to `setup()`
on the new namespace will not be affect any another namespace (including the global
namespace).

```js
var namespace = formatMessage.namespace()

formatMessage.setup({
  locale: "en",
  translations: {
    en: {
      foo: "foo"
    }
  }
})

namespace.setup({
  locale: "fr",
  transations: {
    fr: {
      foo: "bar"
    }
  }
})

formatMessage("foo") // => "foo"
namespace("foo") // => "bar"
```

If you are using a custom namespace and still want to be able to extract strings using the format message CLI, create a module named `format-message.js` that exports the new namespace. Import formatMessage from this module in all other modules that use the namespace.

### Localization apis

format-message also provides a few extra functions to simplify localizing (but not translating) data. These mostly just pass through to `Intl` APIs.

```js
import { number, date, time, select, plural, selectordinal } from 'format-message'
// or
var { number, date, time, select, plural, selectordinal } = require('format-message')
```

### `number(value [, style [, locale ]])`

Convert a number to a localized string.

Parameters

- `value` is the number to format.
- `style` is the optional string name of a style (decimal, integer, percent, etc). Defaults to `'decimal'`.
- `locale` is the optional BCP 47 language tag. If not passed, the locale passed to `setup()` will be used.

### `date(value [, style [, locale ]])`

Convert a date to a localized date string.

Parameters

- `value` is the date to format.
- `style` is the optional string name of a style (short, medium, long, full, etc). Defaults to `'medium'`.
- `locale` is the optional BCP 47 language tag. If not passed, the locale passed to `setup()` will be used.

### `time(value [, style [, locale ]])`

Convert a date to a localized time string.

Parameters

- `value` is the date to format.
- `style` is the optional string name of a style (short, medium, long, full, etc). Defaults to `'medium'`.
- `locale` is the optional BCP 47 language tag. If not passed, the locale passed to `setup()` will be used.

### `select(value, options)`

Select an option by exact text match. (This is not locale-specific.)

Parameters

- `value` is the string to match.
- `options` is an object whose keys are candidates for matching `value`. The value of the property with the matching key is returned, or the `other` property's value. The object should always have an `other` property.

### `plural(value [, offset ], options [, locale ])` and `selectordinal(value [, offset ], options [, locale ])`

Select an option by matching plural rules. `plural` matches rules for cardinal numbers, and `selectordinal` matches rules for ordinal numbers. These function very similar to the parameters `plural` and `selectordinal` embedded in a message.

Parameters

- `value` is the number to match against plural rules.
- `offset` is an optional number subtracted from value before matching keyword plural rules. The offset is not applied when matching exact number options.
- `options` is an object whose keys are candidates for matching `value`. The value of the property with the matching key is returned, or the `other` property's value. The object should always have an `other` property. Keys should be either plural keywords (zero, one, two, few, many, other), or exact number matches (=13, =4, etc). Note that not all languages use all rules. For example English doesn't have a `zero` rule (0 falls under the `other` rule), but can still match `=0`.

### format-message/react

**Deprecated: Use `formatMessage.rich()` instead.**
This module includes utilities for working specifically with react when composing messages with embedded components.

### `formatChildren(message, elements)`

Applies a message to a map of React elements to produce a list of child nodes.

Parameters

- `message` is a pre-formatted string containing tokens marking the beginning and ending of nodes.
- `elements` is an object with keys matching tokens in the message, and values of React elements to put message parts in.

Example

```jsx
import formatMessage from 'format-message'
import {formatChildren} from 'format-message/react'

export default ({ extensions }) =>
  <div title={formatMessage('Choose a file')}>
    {formatChildren(
      formatMessage('Drag & Drop {extensions} files here <0>or</0> <1>Browse</1>', {
        extensions
      }),
      [
        <span className="or" />,
        <span className="browse" />
      ]
    )}
  </div>
```

produces the same tree as

```jsx
<div title="something">
  Drag & Drop {extensions} files here
  <span className="or">or</span>
  <span className="browse">
    Browse
  </span>
</div>
```

You can also provide an Object and use tag names that match the object's property names

```jsx
import formatMessage from 'format-message'
import {formatChildren} from 'format-message/react'

export default ({ extensions }) =>
  <div title={formatMessage('Choose a file')}>
    {formatChildren(
      formatMessage('Drag & Drop {extensions} files here <span1>or</span1> <span2>Browse</span2>', {
        extensions
      }),
      {
        span1: <span className="or" />,
        span2: <span className="browse" />
      }
    )}
  </div>
```
To be valid, a tag name can include any character except `<`, `/`, `>`, and whitespace characters.


### format-message/inferno

**Deprecated: Use `formatMessage.rich()` instead.**
This module includes utilities for working specifically with Inferno when composing messages with embedded components. The API is identical to format-message/react, only it works with Inferno vdom nodes instead of React elements.

### `formatChildren(message, elements)`

Applies a message to a map of vdom nodes to produce a list of child nodes.

Parameters

- `message` is a pre-formatted string containing tokens marking the beginning and ending of nodes.
- `elements` is an object with keys matching tokens in the message, and values of vdom elements to put message parts in.


Example Messages
----------------

The examples provide sample output. Some assume you have configured with translations.

### Simple messages with no placeholders

```js
formatMessage('My Collections')
// "Minhas Coleções"
```

### Simple string placeholders

```js
formatMessage('Welcome, {name}!', { name: 'Bob' })
// "Bem Vindo, Bob!"
```

### String placeholders with nested data

```js
formatMessage('Welcome, {people.wes.name}, {people.julie.name}, and {people.sharon.name}!', {
	people: {
		wes: {
			name: 'Wes Phillips'
		},
		julie: {
			name: 'Julie Roberts'
		},
		sharon: {
			name: 'Sharon Sanders'
		}
	}
})
// "Welcome, Wes Phillips, Julie Roberts, and Sharon Sanders!"
```

### Complex number, date, and time placeholders

```js
formatMessage('{ n, number, percent }', { n: 0.1 })
// or preferred since there is no text to translate:
number(0.1, 'percent')
// "10%"

formatMessage('{ shorty, date, short }', { shorty: new Date() })
// or preferred since there is no text to translate:
date(new Date(), 'short')
// "1/1/15"

formatMessage('You took {n,number} pictures since {d,date} {d,time}', { n: 4000, d: new Date() })
// "You took 4,000 pictures since Jan 1, 2015 9:33:04 AM"
```

### Complex string with select and plural in ES6

```js
import formatMessage from 'format-message'

// using a template string for multiline, NOT for interpolation
formatMessage(`On { date, date, short } {name} ate {
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
// "On 1/1/15 Curious George ate 27 bananas at his house."
```


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/2febdd8/logo.svg
[npm]: https://www.npmjs.org/package/format-message
[npm-image]: https://img.shields.io/npm/v/format-message.svg
[build]: https://travis-ci.org/format-message/format-message
[build-image]: https://img.shields.io/travis/format-message/format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[caniuse-intl]: http://caniuse.com/#feat=internationalization
[icu-message]: http://userguide.icu-project.org/formatparse/messages
[icu-cpp]: http://icu-project.org/apiref/icu4c/classicu_1_1MessageFormat.html
[icu-php]: http://php.net/manual/en/class.messageformatter.php
[icu-java]: http://icu-project.org/apiref/icu4j/
[intl]: https://github.com/andyearnshaw/Intl.js
[icu-for-translators]: http://format-message.github.io/icu-message-format-for-translators/
[format-message-generate-id]: https://github.com/format-message/format-message/tree/master/packages/format-message-generate-id
[message-format]: https://github.com/format-message/message-format
[mdn-intl-datetimeformat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
[mdn-intl-numberformat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
