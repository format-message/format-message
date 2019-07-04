'use strict'

var richTextParams = require('./rich-text-params')

module.exports = function getParamsFromPatternAst (ast, isRich) {
  if (!ast || !ast.slice) return []
  var stack = ast.slice()
  var params = []
  while (stack.length) {
    var element = stack.pop()
    if (typeof element === 'string') continue
    if (element.length === 1 && element[0] === '#') continue

    var name = element[0]
    var type = element[1]
    var isRichParam = isRich && type === '<>'

    if (isRichParam) {
      name = richTextParams.getRichTextParam(name)
    }
    if (params.indexOf(name) < 0) params.push(name)

    if (type === 'select' || type === 'plural' || type === 'selectordinal' || isRichParam) {
      var children = type === 'select' || isRichParam ? element[2] : element[3]
      if (!children) continue
      stack = stack.concat.apply(stack,
        Object.keys(children).map(function (key) { return children[key] })
      )
    }
  }
  return params
}
