// @flow
'use strict'
var formatChildren = require('./base-format-children')

function applyChildren (key/*: string */, element/*: any */, children/*: ?mixed[] */) {
  if (process.env.NODE_ENV !== 'production' && !element.flags) {
    throw new Error(JSON.stringify(element) + ' is not a valid element')
  }
  if (children) {
    children = children.map(function (child) {
      return typeof child !== 'string' ? child : {
        childFlags: 1,
        children: child,
        className: null,
        dom: null,
        flags: 16,
        isValidated: false,
        key: null,
        parentVNode: null,
        props: null,
        ref: null,
        type: null
      }
    })
    element.childFlags = 2
    element.children = children.length === 1 ? children[0] : children
  }
  return element
}

exports.formatChildren = formatChildren.bind(null, applyChildren)
