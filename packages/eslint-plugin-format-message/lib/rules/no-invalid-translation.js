'use strict'

var baseFormatChildren = require('format-message/base-format-children')
var parse = require('format-message-parse')
var visitEachTranslation = require('../util/visit-each-translation')

var formatChildren = baseFormatChildren.bind(null, function (element, children) {
  return '{ ' + element + ', select, other {' + children.join('') + '} }'
})

module.exports = {
  meta: {
    schema: []
  },
  create: function (context) {
    return visitEachTranslation(context, function (info) {
      var id = info.id
      var node = info.node
      var locale = info.locale
      var translation = info.translation
      if (translation == null) {
        return // missing translation is handled in another rule
      }

      try {
        parse(translation)
        if (info.wrappers) {
          // make sure the
          var wrappers = Object.keys(info.wrappers).reduce(function (object, key) {
            object[key] = key
            return object
          }, {})
          var children = formatChildren(translation, wrappers)
          try {
            parse(children.join ? children.join('') : children)
          } catch (error) {
            throw new Error('Wrapping tokens not properly nested in "' + translation + '"')
          }
        }
      } catch (err) {
        context.report(node, 'Translation for "' + id + '" in "' + locale + '" is invalid: ' + err.message)
      }
    })
  }
}
