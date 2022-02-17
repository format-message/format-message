# Changelog

## 6.2.4

Update `MODULE_NAME_PATTERN` to enable more flexible imports.

`MODULE_NAME_PATTERN` is used to determine which files in a project are using `format-message`. Until this point, we only looked for `format-message` as the last segment of the import specifier or require path, e.g. `require("../lib/format-message")` or `import _ from "@lib/i18n/format-message"`.

Starting with v6.2.4, `MODULE_NAME_PATTERN` now finds virtually any import that ends in `format-message`. As long as the character that preceeds `format-message` is _not_ a letter, number, or underscore, the import will be recognized, e.g. `import "@lib.format-message"` or `require("lib/my-format-message")`.
