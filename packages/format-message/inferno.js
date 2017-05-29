'use strict'

var formatChildren = require('./base-format-children')

function applyChildren (key, element, children) {
  if (process.env.NODE_ENV !== 'production' && !element.flags) {
    throw new Error(JSON.stringify(element) + ' is not a valid element')
  }
  if (children) {
    element.children = children.length === 1 ? children[0] : children
  }
  return element
}

exports.formatChildren = formatChildren.bind(null, applyChildren)
