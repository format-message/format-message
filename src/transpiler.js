import locales from './locales.json'
import lookupClosestLocale from 'message-format/lib/lookup-closest-locale'
import { formats } from 'message-format/lib/data'
import { getKeyUnderscoredCrc32 } from './translate-util'

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
 * into this:
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
    this.locale = options.locale || 'en'
    this.functionName = options.functionName || 'formatMessage'
    this.paramsNode = options.paramsNode
    this.originalPattern = options.originalPattern
  }

  transpile (elements) {
    this.vars = {}

    if (elements.length === 0) {
      return { replacement: '""' }
    }

    if (elements.length === 1 && typeof elements[0] === 'string') {
      return { replacement: JSON.stringify(elements[0]) }
    }

    elements = elements.map(
      element => this.transpileElement(element, null)
    )

    const vars = Object.keys(this.vars)
    const key = this.originalPattern || elements.join(' ')
    const functionName = '$$_' + getKeyUnderscoredCrc32(key)
    const replacement = functionName + '(args)' // args needs to be swapped by consumer
    const declaration = 'function ' + functionName + ' (args) {\n' +
      (!vars.length ? '' : '  var ' + vars.join(', ') + ';\n') +
      '  return ' + elements.join(' + ') +
    ';\n}'
    return { replacement, declaration }
  }

  transpileSub (elements, parent) {
    if (elements.length === 0) {
      return '""'
    }

    if (elements.length === 1 && typeof elements[0] === 'string') {
      return JSON.stringify(elements[0])
    }

    elements = elements.map(
      element => this.transpileElement(element, parent)
    )

    return '(' + elements.join(' + ') + ')'
  }

  transpileElement (element, parent) {
    if (typeof element === 'string') {
      return JSON.stringify(element)
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
        return this.transpileSimple(id)
    }
  }

  transpileNumber (id, offset, style) {
    return this.functionName + '.number(' + JSON.stringify(this.locale) + ', ' +
        'args[' + JSON.stringify(id) + ']' +
        (offset ? '-' + offset : '') +
        (style ? ', ' + JSON.stringify(style) : '') +
      ')'
  }

  transpileDateTime (id, type, style) {
    return this.functionName + '.' + type + '(' + JSON.stringify(this.locale) + ', ' +
        'args[' + JSON.stringify(id) + ']' +
        (style ? ', ' + JSON.stringify(style) : '') +
      ')'
  }

  transpilePlural (id, type, offset, children) {
    const parent = [ id, type, offset/*, children*/ ]
    const closest = lookupClosestLocale(this.locale, locales.locales)
    const conditions = locales.locales[closest].plurals[(
      type === 'selectordinal' ? 'ordinal' : 'cardinal'
    )]
    let cond
    let other = '""'
    let select = ''
    let exact = ''
    let sub
    const vars = [
      's=args[' + JSON.stringify(id) + ']',
      'n=+s'
    ]
    const pvars = []
    let refsI = false
    let refsV = false
    let refsW = false
    let refsF = false
    let refsT = false
    this.vars.s = true
    this.vars.n = true
    if (offset) {
      pvars.push('s=+s-' + offset)
      pvars.push('n=s')
    }

    Object.keys(children).forEach((key, i) => {
      sub = '\n      ' +
        this.transpileSub(children[key], parent).replace(/\n/g, '\n      ')
      if (key === 'other') {
        other = sub
      } else if (key.charAt(0) === '=') {
        exact += '\n    ' + key.slice(1) + ' === n ?' + sub + ' :'
      } else if (key in conditions) {
        cond = conditions[key]
        if (/\bi\b/.test(cond)) { this.vars.i = refsI = true }
        if (/\bv\b/.test(cond)) { this.vars.v = refsV = true }
        if (/\bw\b/.test(cond)) { this.vars.w = refsW = true }
        if (/\bf\b/.test(cond)) { this.vars.f = refsF = true }
        if (/\bt\b/.test(cond)) { this.vars.t = refsT = true }
        select += '\n    /*' + key + '*/(' + cond + ') ?' + sub + ' :'
      }
    })
    if (refsI) { pvars.push('i=' + locales.pluralVars.i) }
    if (refsV) { pvars.push('v=' + locales.pluralVars.v) }
    if (refsW) { pvars.push('w=' + locales.pluralVars.w) }
    if (refsF) { pvars.push('f=' + locales.pluralVars.f) }
    if (refsT) { pvars.push('t=' + locales.pluralVars.t) }
    return '(\n    (' + vars.join(', ') + ',' + exact +
      (pvars.length ?
        ('\n\n    (' + pvars.join(', ') + ',' + select + other + ')\n    ))') :
        (select + other + ')\n    )')
      )
  }

  transpileSelect (id, children) {
    let other = '""'
    let select = '(\n    (s=args[' + JSON.stringify(id) + '],'
    this.vars.s = true
    Object.keys(children).forEach((key, i) => {
      if (key === 'other') {
        other = '\n      ' +
          this.transpileSub(children[key]).replace(/\n/g, '\n      ')
        return
      }
      select += '\n    ' +
        JSON.stringify(key) + ' === s ?\n      ' +
        this.transpileSub(children[key]).replace(/\n/g, '\n      ') +
        ' :'
    })
    select += other + ')\n    )'
    return select
  }

  transpileSimple (id) {
    return 'args[' + JSON.stringify(id) + ']'
  }

  static transpile (elements, options) {
    return new Transpiler(options).transpile(elements)
  }

}

export default Transpiler
