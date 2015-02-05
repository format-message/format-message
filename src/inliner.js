import recast from 'recast'
import Parser from './parser'
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
			// no specified locale
			&& node.arguments.length <= 2
		)
	}


	replace(path) {
		let
			node = path.node,
			pattern = this.translate(node.arguments[0].value),
			patternAst = Parser.parse(pattern),
			otherArguments = node.arguments.slice(1),
			replacement

		if (patternAst.length === 1 && 'string' === typeof patternAst[0]) {
			replacement = builders.literal(patternAst[0])
		} else {
			otherArguments.unshift(builders.literal(this.locale))
			if (otherArguments.length < 2) { // no params
				otherArguments.push(builders.literal(null))
			}

			let
				codeString = Transpiler.transpile(patternAst),
				codeAst = recast.parse(codeString),
				funcExpression = codeAst.program.body[0].expression.callee

			replacement = builders.callExpression(
				funcExpression, // callee
				otherArguments // arguments
			)
		}

		path.replace(replacement)
	}


	static inline(source, ...args) {
		return new Inliner(...args).inline(source)
	}

}

export default Inliner

