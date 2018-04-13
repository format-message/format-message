// @flow
'use strict'
const React = require('react')
const formatChildren = require('./base-format-children')

function applyChildren (key/*: string */, element/*: any */, children/*: ?mixed[] */) {
  if (process.env.NODE_ENV !== 'production' && !React.isValidElement(element)) {
    throw new Error(JSON.stringify(element) + ' is not a valid element')
  }

  // $FlowFixMe it doesn't think any arguments are passed
  return React.cloneElement.apply(
    React,
    [ element, { key: element.key || key } ].concat(children || [])
  )
}

exports.formatChildren = formatChildren.bind(null, applyChildren)
