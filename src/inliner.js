import recast from 'recast'
import Parser from 'message-format/dist/parser'
import Transpiler from './transpiler'
let builders = recast.types.builders
let Literal = recast.types.namedTypes.Literal.toString()

/**
 * Transforms source code, translating and inlining `format` calls
 **/
class Inliner {

	constructor(options={}) {
		this.formatName = options.formatName || 'format'
		this.translate = options.translate || (key => key)
		this.locale = options.locale || 'en'
	}


	inline({ sourceCode, sourceFileName, inputSourceMap }) {
		let
			inliner = this,
			ast = recast.parse(sourceCode, { sourceFileName })
		recast.visit(ast, {
			visitCallExpression(path) {
				this.traverse(path) // pre-travserse children
				if (inliner.isReplaceable(path)) {
					inliner.replace(path)
				}
			}
		})

		let sourceMapName = sourceFileName + '.map'
		return recast.print(ast, { sourceMapName, inputSourceMap })
	}


	isReplaceable(path) {
		let node = path.node
		return (
			node.callee.name === this.formatName
			// first argument is a literal string
			&& node.arguments[0]
			&& node.arguments[0].type === Literal
			&& typeof node.arguments[0].value === 'string'
			&& (
				// no specified locale, or is a literal string
				!node.arguments[2]
				|| node.arguments[2].type === Literal
				&& typeof node.arguments[2].value === 'string'
			)
		)
	}


	replace(path) {
		let
			node = path.node,
			locale = node.arguments[2] && node.arguments[2].value || this.locale,
			pattern = this.translate(node.arguments[0].value, locale),
			patternAst = Parser.parse(pattern),
			params = node.arguments[1],
			formatName = this.formatName,
			replacement

		if (patternAst.length === 1 && 'string' === typeof patternAst[0]) {
			replacement = builders.literal(patternAst[0])
		} else if (patternAst.length === 0) {
			replacement = builders.literal('')
		} else {
			let
				codeString = Transpiler.transpile(patternAst, { locale, formatName }),
				codeAst = recast.parse(codeString),
				funcExpression = codeAst.program.body[0].expression,
				otherArguments = [
					params || builders.literal(null),
					builders.literal(locale)
				]

			replacement = builders.callExpression(
				funcExpression, // callee
				otherArguments // arguments
			)
		}

		path.replace(replacement)
	}


	static inline(source, options) {
		return new Inliner(options).inline(source)
	}

}

export default Inliner

