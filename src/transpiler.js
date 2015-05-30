import locales from './locales.json'
import lookupClosestLocale from 'message-format/lib/lookup-closest-locale'
import { getKeyUnderscoredCrc32 } from './translate-util'
import * as babel from 'babel-core'

const types = babel.types
const pluralVars = {
  i: babel.parse('i=' + locales.pluralVars.i).body[0].expression,
  v: babel.parse('v=' + locales.pluralVars.v).body[0].expression,
  w: babel.parse('w=' + locales.pluralVars.w).body[0].expression,
  f: babel.parse('f=' + locales.pluralVars.f).body[0].expression,
  t: babel.parse('t=' + locales.pluralVars.t).body[0].expression
}

/**
 * Transpiler
 *
 * Turns this:
 *  [ "You have ", [ "numBananas", "plural", 0, {
 *       "=0": [ "no bananas" ],
 *      "one": [ "a banana" ],
 *    "other": [ [ '#' ], " bananas" ]
 *  } ], " for sale." ]
 *
 * into ast of this:
 *  `(function(args, locale) {
 *    return "You have " + formatMessage.plural(locale, args["numBananas"], 0, {
 *      "=0": "no bananas",
 *      "one": "a banana",
 *      "other": function() {
 *        return args["numBananas"] + " bananas";
 *      }
 *    }) + " for sale.";
 *  })(args, "en")`
 **/
class Transpiler {

  constructor (options={}) {
    this.vars = {}
    this.originalPattern = options.originalPattern
    this.locale = options.locale || 'en'
    this.node = options.node
  }

  countReferences (elements) {
    const references = {}

    function count (elements) {
      elements.forEach(element => {
        if (!Array.isArray(element)) return
        const name = element[0]
        references[name] = references[name] || 0
        ++references[name]
      })
    }

    count(elements)
    return references
  }

  checkUseArgExpressions (elements) {
    this.useArgExpressions = false
    const blacklist = [ 'plural', 'selectordinal', 'select' ]
    const noIntermediateVars = elements.every(element => {
      return (typeof element === 'string') ||
        (blacklist.indexOf(element[1]) === -1)
    })
    if (!noIntermediateVars) return

    const references = {}
    elements.forEach(element => {
      if (Array.isArray(element)) {
        const name = element[0]
        references[name] = references[name] || 0
        ++references[name]
      }
      // plural, selectordinal, and select already disallowed no need to recurse
    })

    const paramsNode = this.node.arguments[1]
    const noPossibleSideEffects = paramsNode && (
      types.isObjectExpression(paramsNode) &&
      paramsNode.properties.every(prop => {
        return (
          types.isIdentifier(prop.key) && (
            types.isIdentifier(prop.value) ||
            types.isLiteral(prop.value) ||
            references[prop.key.name] === 1
          )
        )
      })
    )
    if (noPossibleSideEffects) {
      this.useArgExpressions = {}
      paramsNode.properties.forEach(prop => {
        this.useArgExpressions[prop.key.name] = prop.value
      })
    }
  }

  transpile (elements) {
    this.vars = {}

    if (elements.length === 0) {
      return { replacement: types.literal('') }
    }

    if (elements.length === 1 && typeof elements[0] === 'string') {
      return { replacement: types.literal(elements[0]) }
    }

    this.checkUseArgExpressions(elements)

    const concatElements = elements.map(
      element => this.transpileElement(element, null)
    ).reduce((left, right) => {
      return types.binaryExpression('+', left, right)
    })

    if (this.useArgExpressions) {
      return { replacement: concatElements }
    }

    const key = this.originalPattern
    const functionName = '$$_' + getKeyUnderscoredCrc32(key)
    const replacement = types.callExpression(
      types.identifier(functionName), // call our declared function
      // pass in original function and arguments
      [ this.node.callee, this.node.arguments[1] ]
    )

    const body = [ types.returnStatement(concatElements) ]
    if (Object.keys(this.vars).length) {
      body.unshift(types.variableDeclaration(
        'var', // type
        Object.keys(this.vars).map(
          name => types.variableDeclarator(
            types.identifier(name),
            this.vars[name]
          )
        )
      ))
    }
    const declaration = types.functionDeclaration(
      types.identifier(functionName),
      [ this.node.callee, types.identifier('args') ],
      types.blockStatement(body),
      false, // isGenerator
      false // isExpression
    )

    return { replacement, declaration }
  }

  transpileSub (elements, parent) {
    if (elements.length === 0) {
      return types.literal('')
    }

    if (elements.length === 1 && typeof elements[0] === 'string') {
      return types.literal(elements[0])
    }

    return elements.map(
      element => this.transpileElement(element, parent)
    ).reduce((left, right) => {
      return types.binaryExpression('+', left, right)
    })
  }

  transpileElement (element, parent) {
    if (typeof element === 'string') {
      return types.literal(element)
    }

    let id = element[0]
    let type = element[1]
    let style = element[2]

    if (id === '#') {
      id = parent[0]
      let offset = parent[2]
      return this.transpileNumber(id, offset, null)
    }

    switch (type) {
      case 'number':
      case 'ordinal': // TODO: rbnf
      case 'spellout': // TODO: rbnf
      case 'duration': // TODO: duration
        return this.transpileNumber(id, 0, style)
      case 'date':
      case 'time':
        return this.transpileDateTime(id, type, style)
      case 'plural':
      case 'selectordinal':
        let offset = element[2]
        let options = element[3]
        return this.transpilePlural(id, type, offset, options)
      case 'select':
        return this.transpileSelect(id, style)
      default:
        return this.transpileArgument(id)
    }
  }

  transpileNumber (id, offset, style) {
    let value = this.transpileArgument(id)
    if (offset) {
      value = types.binaryExpression('-', value, types.literal(offset))
    }
    const args = [
      types.literal(this.locale),
      value
    ]
    if (style) {
      args.push(types.literal(style))
    }
    return types.callExpression(
      types.memberExpression(
        this.node.callee,
        types.identifier('number')
      ),
      args
    )
  }

  transpileDateTime (id, type, style) {
    const args = [
      types.literal(this.locale),
      this.transpileArgument(id)
    ]
    if (style) {
      args.push(types.literal(style))
    }
    return types.callExpression(
      types.memberExpression(
        this.node.callee,
        types.identifier(type)
      ),
      args
    )
  }

  transpilePlural (id, type, offset, children) {
    const parent = [ id, type, offset/*, children*/ ]
    const closest = lookupClosestLocale(this.locale, locales.locales)
    const conditions = locales.locales[closest].plurals[(
      type === 'selectordinal' ? 'ordinal' : 'cardinal'
    )]
    const s = types.identifier('s')
    const n = types.identifier('n')
    let other = types.literal('')
    const vars = [
      types.assignmentExpression(
        '=', s, this.transpileArgument(id)
      ),
      types.assignmentExpression(
        '=', n, types.unaryExpression('+', s, true /* isPrefix */)
      )
    ]
    const pvars = []
    let refsI = false
    let refsV = false
    let refsW = false
    let refsF = false
    let refsT = false
    if (offset) {
      pvars.push(types.assignmentExpression(
        '=', n, types.assignmentExpression(
          '=', s, types.binaryExpression(
            '-',
            types.unaryExpression('+', s, true /* isPrefix */),
            types.literal(offset)
          )
        )
      ))
    }

    const exactConditions = []
    const keyConditions = []
    Object.keys(children).forEach(key => {
      const expr = this.transpileSub(children[key], parent)
      if (key === 'other') {
        other = expr
      } else if (key.charAt(0) === '=') {
        const test = types.binaryExpression('===', n, types.literal(+key.slice(1)))
        exactConditions.push({ test, expr })
      } else if (key in conditions) {
        let cond = conditions[key]
        if (/\bi\b/.test(cond)) { refsI = !(this.vars.i = null) }
        if (/\bv\b/.test(cond)) { refsV = !(this.vars.v = null) }
        if (/\bw\b/.test(cond)) { refsW = !(this.vars.w = null) }
        if (/\bf\b/.test(cond)) { refsF = !(this.vars.f = null) }
        if (/\bt\b/.test(cond)) { refsT = !(this.vars.t = null) }
        const test = babel.parse(cond).body[0].expression
        keyConditions.push({ test, expr })
      }
    })
    if (refsI) { pvars.push(pluralVars.i) }
    if (refsV) { pvars.push(pluralVars.v) }
    if (refsW) { pvars.push(pluralVars.w) }
    if (refsF) { pvars.push(pluralVars.f) }
    if (refsT) { pvars.push(pluralVars.t) }

    if (!exactConditions.length && !keyConditions.length) {
      return other
    }

    this.vars.s = null
    this.vars.n = null
    return types.sequenceExpression(vars.concat([
      exactConditions.reduceRight(
        (alt, { test, expr }) => {
          return types.conditionalExpression(test, expr, alt)
        },
        types.sequenceExpression(pvars.concat([
          keyConditions.reduceRight((alt, { test, expr }) => {
            return types.conditionalExpression(test, expr, alt)
          }, other)
        ]))
      )
    ]))
  }

  transpileSelect (id, children) {
    const s = types.identifier('s')
    let other = types.literal('')
    const conditions = []
    Object.keys(children).forEach(key => {
      if (key === 'other') {
        other = this.transpileSub(children[key])
        return
      }
      conditions.push({
        test: types.binaryExpression('===', s, types.literal(key)),
        expr: this.transpileSub(children[key])
      })
    })

    if (!conditions.length) { return other }

    this.vars.s = null
    return types.sequenceExpression([
      types.assignmentExpression(
        '=', s, this.transpileArgument(id)
      ),
      conditions.reduceRight((alt, { test, expr }) => {
        return types.conditionalExpression(test, expr, alt)
      }, other)
    ])
  }

  transpileArgument (id) {
    return this.useArgExpressions ?
      this.useArgExpressions[id] :
      types.memberExpression(
        types.identifier('args'),
        types.literal(id),
        true
      )
  }

  static transpile (elements, options) {
    return new Transpiler(options).transpile(elements)
  }

}

export default Transpiler
