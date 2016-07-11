# ![format-message][logo]

> Internationalize text, numbers, and dates using ICU Message Format.

[![npm Version][npm-image]][npm]
[![Build Status][build-image]][build]

[![JS Standard Style][style-image]][style]
[![MIT License][license-image]][LICENSE]


## Internationalization Made Easy

Start simple. Wrap any user-facing with `formatMessage()`. Don't forget to import/require format-message.

```js
var formatMessage = require('format-message');
// ...
formatMessage('My Account Preferences')
```

Don't concatenate message pieces, use placeholders instead.

```js
formatMessage('Hello, { name }!', { name: user.name })
```

You can even pick plural and gender forms with placeholders.

```js
formatMessage(`{
  gender, select,
    male {His inbox}
  female {Her inbox}
   other {Their inbox}
 }`, { gender: user.gender })

 formatMessage(`{
   count, plural,
      =0 {No unread messages}
     one {# unread message}
   other {# unread messages}
 }`, { count: messages.unreadCount })
```

Need to provide extra information to translators? Add a message description.
Need 2 translations to the same English message? Add a message id.

```js
formatMessage({
  id: 'update_action_button',
  default: 'Update',
  description: 'Text displayed on the update resource button to trigger the update process'
})
formatMessage({
  id: 'update_label',
  default: 'Update',
  description: 'Label on each item that is an update to another item'
})
```

Extract all of the messages you've used in your source code.

```bash
$ npm i format-message-cli
$ format-message extract "src/**/*.js" > ./locales/en/messages.json
```

Check that the translators preserved placeholders and proper message formatting.

```bash
$ format-message lint -t ./locales/index.js "src/**/*.js"
```

Use the translations at runtime.

```js
formatMessage.setup({
  generateId: require('format-message-generate-id/underscored_crc32'),
  translations: require('./locales'),
  locale: 'pt'
})
```

Make a locale-specific build.

```bash
$ format-message transform --inline --locale pt "src/**/*.js" > bundle.pt.js
```


### Need more details?

Check out the many ways you can use format-message in your project:

* [message-format](https://github.com/format-message/format-message/tree/master/packages/message-format)
* [format-message](https://github.com/format-message/format-message/tree/master/packages/format-message)
* [format-message-cli](https://github.com/format-message/format-message/tree/master/packages/format-message-cli)
* [eslint-plugin-format-message](https://github.com/format-message/format-message/tree/master/packages/eslint-plugin-format-message)
* [babel-plugin-extract-format-message](https://github.com/format-message/format-message/tree/master/packages/babel-plugin-extract-format-message)
* [babel-plugin-transform-format-message](https://github.com/format-message/format-message/tree/master/packages/babel-plugin-transform-format-message)


License
-------

This software is free to use under the MIT license. See the [LICENSE-MIT file][LICENSE] for license text and copyright information.


[logo]: https://cdn.rawgit.com/format-message/format-message/2febdd8/logo.svg
[npm]: https://www.npmjs.org/package/format-message
[npm-image]: https://img.shields.io/npm/v/format-message.svg
[deps]: https://david-dm.org/format-message/format-message
[deps-image]: https://img.shields.io/david/format-message/format-message.svg
[dev-deps]: https://david-dm.org/format-message/format-message#info=devDependencies
[dev-deps-image]: https://img.shields.io/david/dev/format-message/format-message.svg
[build]: https://travis-ci.org/format-message/format-message
[build-image]: https://img.shields.io/travis/format-message/format-message.svg
[style]: https://github.com/feross/standard
[style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[license-image]: https://img.shields.io/npm/l/format-message.svg
[message-format]: https://github.com/format-message/message-format
[LICENSE]: https://github.com/format-message/format-message/blob/master/LICENSE-MIT
