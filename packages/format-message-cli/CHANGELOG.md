# Changelog

## 4.0.1

Don't use babel-eslint for the lint command, as it causes more issues than it solves.
Users that need ES7+ features can use the eslint-plugin-format-message directly.

## 4.0.0

Entirely rewritten cli using the babel and eslint plugins, and aligning to the
4.x format-message option naming.
