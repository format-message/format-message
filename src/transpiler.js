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
 *  `(function(locale, args) {
 *    return "You have " +
 *      format.plural(locale, args["numBananas"], 0, {
 *        "=0": "no bananas",
 *        "one": "a banana",
 *        "other": function() {
 *          return args["numBananas"] +
 *            " bananas";
 *        }
 *      }) +
 *      " for sale.";
 *  })("en", args)`
 **/
class Transpiler {

	constructor(options={}) {
		this.formatName = options.formatName || 'format'
	}


	transpile(elements) {
		elements = elements.map(
			element => this.transpileElement(element, null)
		)

		return '(function(locale, args) {\n' +
			'  return ' + elements.join(' +\n    ') +
		';\n}())'
	}


	transpileSub(elements, parent) {
		if (1 === elements.length && 'string' === typeof elements[0]) {
			return JSON.stringify(elements[0])
		}

		elements = elements.map(
			element => this.transpileElement(element, parent)
		)

		return 'function() {\n' +
			'  return ' + elements.join(' +\n    ') +
		';\n}'
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
				return this.transpileNumber(id, 0, style)
			case 'date':
			case 'time':
				return this.transpileDateTime(id, type, style)
			case 'plural':
				let
					offset = element[2],
					options = element[3]
				return this.transpilePlural(id, offset, options)
			case 'select':
				return this.transpileSelect(id, style)
			default:
				return this.transpileSimple(id)
		}
	}


	transpileNumber(id, offset, style) {
		return this.formatName + '.number(locale, ' +
				'args[' + JSON.stringify(id) + ']' +
				(offset ? '-' + offset : '') +
				(style ? ', ' + JSON.stringify(style) : '') +
			')'
	}


	transpileDateTime(id, type, style) {
		return this.formatName + '.' + type + '(locale, ' +
				'args[' + JSON.stringify(id) + ']' +
				(style ? ', ' + JSON.stringify(style) : '') +
			')'
	}


	transpileOptions(children, parent) {
		let options = '{'
		Object.keys(children).forEach((key, i) => {
			if (i > 0) { options += ',' }
			options +=
				'\n      ' + JSON.stringify(key) + ': ' +
				this.transpileSub(children[key], parent).replace(/\n/g, '\n      ')
		})
		options += '\n    }'
		return options
	}


	transpilePlural(id, offset, children) {
		let
			parent = [ id, 'plural', offset/*, children*/ ],
			options = this.transpileOptions(children, parent)
		return this.formatName + '.plural(locale, ' +
				'args[' + JSON.stringify(id) + '], ' +
				offset + ', ' +
				options +
			')'
	}


	transpileSelect(id, children) {
		let options = this.transpileOptions(children, null)
		return this.formatName + '.select(locale, ' +
				'args[' + JSON.stringify(id) + '], ' +
				options +
			')'
	}


	transpileSimple(id) {
		return 'args[' + JSON.stringify(id) + ']'
	}


	static transpile(elements, options) {
		return new Transpiler(options).transpile(elements)
	}

}

export default Transpiler

