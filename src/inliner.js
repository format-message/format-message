import recast from 'recast'
import Parser from 'message-format/dist/parser'
import Transpiler from './transpiler'
let builders = recast.types.builders
let Literal = recast.types.namedTypes.Literal.toString()
let TemplateLiteral = recast.types.namedTypes.TemplateLiteral.toString()

/**
 * Transforms source code, translating and inlining `format` calls
 **/
class Inliner {

	constructor(options={}) {
		this.formatName = options.formatName || 'format'
		this.translate = options.translate || (key => key)
		this.locale = options.locale || 'en'
		this.functions = []
	}


	inline({ sourceCode, sourceFileName, inputSourceMap }) {
		this.functions.length = 0
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
		ast.program.body = ast.program.body.concat(this.getFunctionsStatements())

		let sourceMapName = sourceFileName + '.map'
		return recast.print(ast, { sourceMapName, inputSourceMap })
	}


	getLiteralValue(literal) {
		if (literal.type === TemplateLiteral) {
			return literal.quasis[0].value.cooked
		}
		return literal.value
	}


	isReplaceable(path) {
		let node = path.node
		return (
			node.callee.name === this.formatName
			// first argument is a literal string, or template literal with no expressions
			&& node.arguments[0]
			&& (
				node.arguments[0].type === Literal
				&& typeof node.arguments[0].value === 'string'
				|| (
					node.arguments[0].type === TemplateLiteral
					&& node.arguments[0].expressions.length === 0
					&& node.arguments[0].quasis.length === 1
				)
			)
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
			pattern = this.translate(this.getLiteralValue(node.arguments[0]), locale),
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
				functionName = '$$message_format_' + this.functions.length,
				codeString = Transpiler.transpile(patternAst, { locale, formatName, functionName }),
				calleeExpr = builders.identifier(functionName),
				otherArguments = [
					params || builders.literal(null)
				]
			this.functions.push(codeString)

			replacement = builders.callExpression(
				calleeExpr, // callee
				otherArguments // arguments
			)
		}

		path.replace(replacement)
	}


	getFunctionsStatements() {
		let
			codeString = this.functions.join('\n'),
			codeAst = recast.parse(codeString)
		this.functions.length = 0
		return codeAst.program.body
	}


	static inline(source, options) {
		return new Inliner(options).inline(source)
	}

}

export default Inliner

