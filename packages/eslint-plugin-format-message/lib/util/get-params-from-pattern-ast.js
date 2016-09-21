'use strict'

module.exports = function getParamsFromPatternAst (ast) {
  if (!ast || !ast.slice) return []
  var stack = ast.slice()
  var params = []
  while (stack.length) {
    var element = stack.pop()
    if (typeof element === 'string') continue
    if (element.length === 1 && element[0] === '#') continue

    var name = element[0]
    if (params.indexOf(name) < 0) params.push(name)

    var type = element[1]
    if (type === 'select' || type === 'plural' || type === 'selectordinal') {
      var children = type === 'select' ? element[2] : element[3]
      stack = stack.concat.apply(stack,
        Object.keys(children).map(function (key) { return children[key] })
      )
    }
  }
  return params
}
