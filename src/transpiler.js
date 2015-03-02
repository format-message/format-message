import locales from './locales.json'
import lookupClosestLocale from 'message-format/lib/lookup-closest-locale'
import data from 'message-format/lib/data'
let formats = data.formats

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
 *    return "You have " + format.plural(locale, args["numBananas"], 0, {
 *      "=0": "no bananas",
 *      "one": "a banana",
 *      "other": function() {
 *        return args["numBananas"] + " bananas";
 *      }
 *    }) + " for sale.";
 *  })(args, "en")`
 **/
class Transpiler {

	constructor(options={}) {
		this.vars = {}
		this.locale = options.locale || 'en'
		this.formatName = options.formatName || 'format'
		this.functionName = options.functionName || ''
	}


	transpile(elements) {
		this.vars = {}
		elements = elements.map(
			element => this.transpileElement(element, null)
		)

		if (0 === elements.length) {
			return '""'
		}

		let
			vars = Object.keys(this.vars),
			init = vars.length === 0 ? '' :
				'\tvar ' + vars.join(', ') + ';\n'
		return 'function ' + this.functionName + '(args) {\n' +
			init +
			'\treturn ' + elements.join(' + ') +
		';\n}'
	}


	transpileSub(elements, parent) {
		if (0 === elements.length) {
			return '""'
		}

		if (1 === elements.length && 'string' === typeof elements[0]) {
			return JSON.stringify(elements[0])
		}

		elements = elements.map(
			element => this.transpileElement(element, parent)
		)

		return '(' + elements.join(' + ') + ')'
	}


	transpileElement(element, parent) {
		if ('string' === typeof element) {
			return JSON.stringify(element)
		}

		let
			id = element[0],
			type = element[1],
			style = element[2]

		if ('#' === id) {
			let
				id = parent[0],
				offset = parent[2]
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
				let
					offset = element[2],
					options = element[3]
				return this.transpilePlural(id, type, offset, options)
			case 'select':
				return this.transpileSelect(id, style)
			default:
				return this.transpileSimple(id)
		}
	}


	transpileNumberInline(id, offset, style='medium') {
		let opts = formats.number[style]
		return 'new Intl.NumberFormat(' + JSON.stringify(this.locale) + ', ' +
			JSON.stringify(opts) + ').format(args[' +
			JSON.stringify(id) + ']' + (offset ? '-' + offset : '') + ')'
	}


	transpileDateTimeInline(id, type, style='medium') {
		let opts = formats[type][style]
		return 'new Intl.DateTimeFormat(' + JSON.stringify(this.locale) + ', ' +
			JSON.stringify(opts) + ').format(args[' +
			JSON.stringify(id) + '])'
	}


	transpileNumber(id, offset, style) {
		return this.formatName + '.number(' + JSON.stringify(this.locale) + ', ' +
				'args[' + JSON.stringify(id) + ']' +
				(offset ? '-' + offset : '') +
				(style ? ', ' + JSON.stringify(style) : '') +
			')'
	}


	transpileDateTime(id, type, style) {
		return this.formatName + '.' + type + '(' + JSON.stringify(this.locale) + ', ' +
				'args[' + JSON.stringify(id) + ']' +
				(style ? ', ' + JSON.stringify(style) : '') +
			')'
	}


	transpilePlural(id, type, offset, children) {
		let
			parent = [ id, type, offset/*, children*/ ],
			closest = lookupClosestLocale(this.locale, locales.locales),
			conditions = locales.locales[closest].plurals[(
        'selectordinal' === type ? 'ordinal' : 'cardinal'
      )],
      cond,
			other = '""', select = '', exact = '', sub,
			vars = [
				's=args[' + JSON.stringify(id) + ']',
				'n=+s'
			],
			pvars = [],
			refsI = false,
			refsV = false,
			refsW = false,
			refsF = false,
			refsT = false
		this.vars.s = true
		this.vars.n = true
		if (offset) {
			pvars.push('s=+s-' + offset)
			pvars.push('n=s')
		}

		Object.keys(children).forEach((key, i) => {
			sub = '\n\t\t\t' +
				this.transpileSub(children[key], parent).replace(/\n/g, '\n\t\t\t')
			if ('other' === key) {
				other = sub
			} else if ('=' === key.charAt(0)) {
				exact += '\n\t\t' + key.slice(1) + ' === n ?' + sub + ' :'
			} else if (key in conditions) {
				cond = conditions[key]
				if (/\bi\b/.test(cond)) { this.vars.i = refsI = true }
				if (/\bv\b/.test(cond)) { this.vars.v = refsV = true }
				if (/\bw\b/.test(cond)) { this.vars.w = refsW = true }
				if (/\bf\b/.test(cond)) { this.vars.f = refsF = true }
				if (/\bt\b/.test(cond)) { this.vars.t = refsT = true }
				select += '\n\t\t/*' + key + '*/(' + cond + ') ?' + sub + ' :'
			}
		})
		if (refsI) { pvars.push('i=' + locales.pluralVars.i) }
		if (refsV) { pvars.push('v=' + locales.pluralVars.v) }
		if (refsW) { pvars.push('w=' + locales.pluralVars.w) }
		if (refsF) { pvars.push('f=' + locales.pluralVars.f) }
		if (refsT) { pvars.push('t=' + locales.pluralVars.t) }
		return '(\n\t\t(' + vars.join(', ') + ',' + exact +
			(pvars.length ?
				('\n\n\t\t(' + pvars.join(', ') + ',' + select + other + ')\n\t\t))') :
				(select + other + ')\n\t\t)')
			)
	}


	transpileSelect(id, children) {
		let
			other = '""',
			select = '(\n\t\t(s=args[' + JSON.stringify(id) + '],'
		this.vars.s = true
		Object.keys(children).forEach((key, i) => {
			if ('other' === key) {
				other = '\n\t\t\t' +
					this.transpileSub(children[key]).replace(/\n/g, '\n\t\t\t')
				return
			}
			select += '\n\t\t' +
				JSON.stringify(key) + ' === s ?\n\t\t\t' +
				this.transpileSub(children[key]).replace(/\n/g, '\n\t\t\t') +
				' :'
		})
		select += other + ')\n\t\t)'
		return select
	}


	transpileSimple(id) {
		return 'args[' + JSON.stringify(id) + ']'
	}


	static transpile(elements, options) {
		return new Transpiler(options).transpile(elements)
	}

}

export default Transpiler

