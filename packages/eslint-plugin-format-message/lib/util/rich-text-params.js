'use strict'

var richTagCache = []
function getRichTextParam (name) {
  var cachedTag = richTagCache.find(function (cacheEntry) {
    return cacheEntry.name === name
  })
  if (cachedTag) return cachedTag

  var tag = {
    isRich: true,
    name: name,
    toString: function () { return '<' + name + '>' }
  }
  richTagCache.push(tag)
  return tag
}

function isRichTextParam (param) {
  return typeof param === 'object' && param.isRich === true
}

module.exports = {
  getRichTextParam: getRichTextParam,
  isRichTextParam: isRichTextParam
}
