'use strict'

var formatChildren = require('./base-format-children')

function applyChildren (element, children) {
  if (process.env.NODE_ENV !== 'production' && !element.setChildren) {
    throw new Error(JSON.stringify(element) + ' is not a valid element')
  }
  return element.setChildren(children.length === 1 ? children[0] : children)
}

exports.formatChildren = formatChildren.bind(null, applyChildren)
