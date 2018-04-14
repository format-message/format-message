# eslint-plugin-format-message

> [format-message][format-message] i18n specific rules for ESLint

[![npm Version][npm-image]][npm]
[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


Quick Start
-----------

Install [ESLint][eslint] and this plugin.

```sh
npm install --save eslint eslint-plugin-format-message
```

Then add `plugins` section to your ESLint configuration.

```js
{
  "plugins": [
    "format-message"
  ]
}
```

Configure the rules you want to use. These are the defaults.

```js
{
  "rules": {
    "format-message/literal-pattern": 1,
    "format-message/literal-locale": 1,
    "format-message/no-identical-translation": 1,
    "format-message/no-invalid-pattern": 2,
    "format-message/no-invalid-translation": 2,
    "format-message/no-missing-params": [ 2, { "allowNonLiteral": true } ],
    "format-message/no-missing-translation": 1,
    "format-message/translation-match-params": 2
  },
  "settings": {
    "format-message": {
    }
  }
}
```

Here is another example configuration.

```js
{
  "rules": {
    "format-message/literal-pattern": 2,
    "format-message/literal-locale": 2,
    "format-message/no-identical-translation": 0,
    "format-message/no-invalid-pattern": 2,
    "format-message/no-invalid-translation": 2,
    "format-message/no-missing-params": [ 2, { allowNonLiteral: false } ],
    "format-message/no-missing-translation": 1,
    "format-message/translation-match-params": 2
  },
  "settings": {
    "format-message": {
      "generateId": "normalized",
      "sourceLocale": "en-GB",
      "translations": "./locales"
    }
  }
}
```


Rules
-----

#### literal-pattern

For the `format-message` tools to replace messages with their translations at build time, as well as optimize runtime performance, the message pattern must be a string literal.

By default this is a warning, since the message can still be translated at run time, if you have configured properly with `formatMessage.setup(options)`.

#### literal-locale

If a locale is specified in `formatMessage` calls, it must be a literal string so that the translation can be replaced at build time. Most of the time, no locale should be specified, and the current locale is used.

By default this is a warning, since the message can still be translated at run time, if you have configured properly with `formatMessage.setup(options)`.

#### no-identical-translation

If translation settings are provided, the translation of each messages should be distinct from the default message in the source code. The exception is if the translation locale matches the source locale, then identical translation is allowed. (For example "en-US" and "en-AU" are allowed to be identical to a source in "en-US".)

By default this is a warning, since it often means the message wasn't actually translated.

#### no-invalid-pattern

The message patterns must be valid ICU Message Format syntax, or the call to `formatMessage` will throw an error. This rule allows you to fix these errors early.

Since these problems will cause an error to be thrown at run time, by default this rule reports an error.

#### no-invalid-translation

If translation settings are provided, the translations must be valid ICU Message Format syntax, or the call to `formatMessage` will throw an error. This rule allows you to fix these errors early.

Since these problems will cause an error to be thrown at run time, by default this rule reports an error.

#### no-missing-params

If a message pattern requires parameters, missing those parameters will cause an error or malformed message at run time. This rule helps you to quickly find and fix these problems.

Since these problems can cause errors, by default this rule reports an error.

This rule takes an object for an argument. If the object has a truthy `allowNonLiteral` property, then passing a variable instead of an object literal is assumed to have all the necessary parameters.

Parameters support nested data objects. To prevent any issues, it's recommended that you avoid using object keys with `.` if you're using nested data.

#### no-missing-translation

If translation settings are provided, each locale must have a translation for each message.

By default this is a warning, serving as a reminder to ensure all messages get translated.

#### translation-match-params

If translation settings are provided, each translation must include the same placeholders found in the default message pattern found in the source code.

Since these problems can cause errors, by default this rule reports an error.

#### no-invalid-plural-keywords

If a pattern or translation has a sub-message for a plural keyword that doesn't apply to the locale is used, the sub-message will never be displayed.

By default this is a warning, since no errors will occur when the message is used.

#### no-missing-plural-keywords

If a pattern or translation is missing a plural sub-message for a keyword that applies to the locale, the "other" sub-message will be used instead. Missing the "other" sub-message makes the message invalid, which is handled by other rules.

This recommended as a warning, since the "other" sub-message will be displayed, but by default is disabled.


Settings
--------

You can configure settings for this plugin in a `"format-message"` object in the `"settings"` section of your eslint config. These settings inform the plugin where you store translations, how inferred keys are generated from default patterns, and what locale the default patterns are written in.

As in the example above, the following settings can be provided:

* `sourceLocale` specifies what locale the default patterns use in the source code.
* `generateId` is one of `literal`, `normalized`, `underscored`, or `underscored_crc32`. This determines how to translate a default pattern to the key to lookup the translation.
* `translations` is an object containing a property per locale. Each locale property is a object mapping keys to translations.
  * `translations` may also string path, relative to the current working directory, indicating a module to require that matches the above description.
    * example: `"translations": "./locales"`
    * locales.json contains: `{ "en-US": { "course_8a63b4a3": "Course" }, "pt-BR": { "course_8a63b4a3": "Curso" } }`
    * each message entry can also be of the form: `"course_8a63b4a3": { "message": "Course", "description": "An educational course." }`
  * each locale property in `translations` may also be a string path to a module that matches the above description.
    * example: `"translations": { "en-US": "./en.json", "pt-BR": "./pt-BR.json" }`
    * en.json contains: `{ "en-US": { "course_8a63b4a3": "Course", "quiz_e0dcce8f": "Quiz" } }`
    * pt-BR.json contains: `{ "pt-BR": { "course_8a63b4a3": "Curso", "quiz_e0dcce8f": "Questionário" } }`


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[npm]: https://www.npmjs.org/package/eslint-plugin-format-message
[npm-image]: https://img.shields.io/npm/v/eslint-plugin-format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/eslint-plugin-format-message.svg
[eslint]: http://eslint.org
[format-message]: https://github.com/format-message/format-message
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
