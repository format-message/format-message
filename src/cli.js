import program from 'commander'
import { existsSync, readFileSync } from 'fs'
import glob from 'glob'
import Inliner from '../dist/inliner'
import pkg from '../package.json'


function flattenFiles(files) {
	let flat = []
	files = [].concat(files || [])
	files.forEach(function(pattern) {
		flat = flat.concat(glob.sync(pattern))
	})
	return flat
}


function addStdinToFiles(files, options, next) {
	if (files.length === 0) {
		let
			sourceFileName = options.filename,
			sourceCode = ''
		process.stdin.setEncoding('utf8')
		process.stdin.on('readable', function() {
			let chunk = process.stdin.read()
			if (chunk) {
				sourceCode += chunk
			}
		})
		process.stdin.on('end', function() {
			files.push({ sourceCode, sourceFileName })
			next()
		})
	} else {
		next()
	}
}


/**
 * version
 **/
program
	.version(pkg.version)
	.option('-c, --color', 'use colors in errors and warnings')
	.option('--no-color', 'do not use colors in errors and warnings')


/**
 * message-format lint src/*.js
 *  find message patterns in files and verify there are no obvious problems
 **/
program
	.command('lint <files...>')
	.description('find message patterns in files and verify there are no obvious problems')
	.option('-f, --function-name [name]', 'find function calls with this name [format]', 'format')
	.option('-k, --key-type [type]',
		'derived key from source pattern literal|normalized|underscored|underscored_crc32 [underscored_crc32]',
		'underscored_crc32'
	)
	.option('-t, --translations [path]',
		'location of the JSON file with message translations,' +
			' if specified, translations are also checked for errors'
	)
	.action(function(files, options) {
		files = flattenFiles(files)

		let errors = []
		files.forEach(function(file) {
			if (!existsSync(file)) {
				errors.push(file + ' doesn\'t exist')
			}
		})
		if (options.translations) {
			if (!existsSync(options.translations)) {
				errors.push(options.translations + ' doesn\'t exist')
			}
			try {
				options.translations = JSON.parse(
					readFileSync(options.translations, 'utf8')
				)
			} catch(err) {
				errors.push(err.message)
			}
		}
		if (errors.length) {
			console.error(errors.join('. '))
			process.exit(2)
		}

		addStdinToFiles(files, options, function() {
			Inliner.lintFiles(files, {
				functionName: options.functionName,
				translations: options.translations,
				keyType: options.keyType
			})
		})
	})


/**
 * message-format extract src/*.js
 *  find and list all message patterns in files
 **/
program
	.command('extract <files...>')
	.description('find and list all message patterns in files')
	.option('-f, --function-name [name]', 'find function calls with this name [format]', 'format')
	.option('-k, --key-type [type]',
		'derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
		'underscored_crc32'
	)
	.option('-l, --locale [locale]', 'BCP 47 language tags specifying the source default locale [en]', 'en')
	.option('-o, --out-file [out]', 'write messages JSON object to this file instead of to stdout')
	.action(function(files, options) {
		files = flattenFiles(files)

		let errors = []
		files.forEach(function(file) {
			if (!existsSync(file)) {
				errors.push(file + ' doesn\'t exist')
			}
		})
		if (errors.length) {
			console.error(errors.join('. '))
			process.exit(2)
		}

		addStdinToFiles(files, options, function() {
			Inliner.extractFromFiles(files, {
				functionName: options.functionName,
				locale: options.locale,
				keyType: options.keyType,
				outFile: options.outFile
			})
		})
	})


/**
 * message-format inline src/*.js
 *  find and replace message pattern calls in files with translations
 **/
program
	.command('inline <files...>')
	.alias('transpile')
	.description('find and replace message pattern calls in files with translations')
	.option('-f, --function-name [name]', 'find function calls with this name [format]', 'format')
	.option('-k, --key-type [type]',
		'derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
		'underscored_crc32'
	)
	.option('-l, --locale [locale]', 'BCP 47 language tags specifying the target locale [en]', 'en')
	.option('-t, --translations [path]', 'location of the JSON file with message translations')
	.option('-i, --source-maps-inline', 'append sourceMappingURL comment to bottom of code')
	.option('-s, --source-maps', 'save source map alongside the compiled code')
	.option('-f, --filename [filename]', 'filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]', 'stdin')
	.option('-o, --out-file [out]', 'compile all input files into a single file')
	.option('-d, --out-dir [out]', 'compile an input directory of modules into an output directory')
	.action(function(files, options) {
		files = flattenFiles(files)

		let errors = []
		files.forEach(function(file) {
			if (!existsSync(file)) {
				errors.push(file + ' doesn\'t exist')
			}
		})
		if (options.outDir && !files.length) {
			errors.push('files required for --out-dir')
		}
		if (options.outFile && options.outDir) {
			errors.push('cannot have --out-file and --out-dir')
		}
		if (options.sourceMaps && !options.outFile && !options.outDir) {
			errors.push('--source-maps requires --out-file or --out-dir')
		}
		if (!options.translations) {
			errors.push('required --translations missing')
		}
		if (!existsSync(options.translations)) {
			errors.push(options.translations + ' doesn\'t exist')
		}
		try {
			options.translations = JSON.parse(
				readFileSync(options.translations, 'utf8')
			)
		} catch(err) {
			errors.push(err.message)
		}
		if (errors.length) {
			console.error(errors.join('. '))
			process.exit(2)
		}

		addStdinToFiles(files, options, function() {
			Inliner.inlineFiles(files, {
				functionName: options.functionName,
				locale: options.locale,
				keyType: options.keyType,
				translations: options.translations,
				sourceMaps: options.sourceMapsInline ? 'inline' : options.sourceMaps,
				filename: options.filename,
				outFile: options.outFile,
				outDir: options.outDir
			})
		})
	})


program
	.parse(process.argv)

if (process.argv.length < 3) {
	program.help()
}

