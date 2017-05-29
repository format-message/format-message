'use strict'

var React = require('react')
var formatChildren = require('./base-format-children')

var __counter__ = 0

function makeKey (element) {
  return element.type + '::' + (__counter__++).toString(16)
}

function applyChildren (element, children) {
  if (process.env.NODE_ENV !== 'production' && !React.isValidElement(element)) {
    throw new Error(JSON.stringify(element) + ' is not a valid element')
  }
  var key = element.key || makeKey(element)
  return React.cloneElement.apply(React, [ element, { key: key } ].concat(children || []))
}

exports.formatChildren = formatChildren.bind(null, applyChildren)
