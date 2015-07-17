var program = require('commander')
var fsUtil = require('fs')
var glob = require('glob')
var Linter = require('format-message-core/lib/linter')
var Extractor = require('format-message-core/lib/extractor')
var Inliner = require('format-message-core/lib/inliner')
var pkg = require('../package.json')

var existsSync = fsUtil.existsSync
var readFileSync = fsUtil.readFileSync

function flattenFiles (files) {
  var flat = []
  files = [].concat(files || [])
  files.forEach(function (pattern) {
    flat = flat.concat(glob.sync(pattern))
  })
  return flat
}

function addStdinToFiles (files, options, next) {
  if (files.length === 0) {
    var sourceFileName = options.filename
    var sourceCode = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('readable', function () {
      var chunk = process.stdin.read()
      if (chunk) {
        sourceCode += chunk
      }
    })
    process.stdin.on('end', function () {
      files.push({ sourceCode: sourceCode, sourceFileName: sourceFileName })
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
  .option('--color', 'use colors in errors and warnings')
  .option('--no-color', 'do not use colors in errors and warnings')

/**
 * format-message lint src/*.js
 *  find message patterns in files and verify there are no obvious problems
 **/
program
  .command('lint [files...]')
  .description('find message patterns in files and verify there are no obvious problems')
  .option('-n, --function-name [name]', 'find function calls with this name [formatMessage]', 'formatMessage')
  .option('--no-auto', 'disables auto-detecting the function name from import or require calls')
  .option('-k, --key-type [type]',
    'derived key from source pattern literal|normalized|underscored|underscored_crc32 [underscored_crc32]',
    'underscored_crc32'
  )
  .option('-t, --translations [path]',
    'location of the JSON file with message translations,' +
      ' if specified, translations are also checked for errors'
  )
  .option('-f, --filename [filename]', 'filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]', 'stdin')
  .action(function (files, options) {
    files = flattenFiles(files)

    var errors = []
    files.forEach(function (file) {
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

    addStdinToFiles(files, options, function () {
      Linter.lintFiles(files, {
        functionName: options.functionName,
        autoDetectFunctionName: options.auto,
        translations: options.translations,
        keyType: options.keyType
      })
    })
  })

/**
 * format-message extract src/*.js
 *  find and list all message patterns in files
 **/
program
  .command('extract [files...]')
  .description('find and list all message patterns in files')
  .option('-n, --function-name [name]', 'find function calls with this name [formatMessage]', 'formatMessage')
  .option('--no-auto', 'disables auto-detecting the function name from import or require calls')
  .option('-k, --key-type [type]',
    'derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
    'underscored_crc32'
  )
  .option('-l, --locale [locale]', 'BCP 47 language tags specifying the source default locale [en]', 'en')
  .option('--no-instructions', 'disables adding the default instructions to the output')
  .option('-o, --out-file [out]', 'write messages to this file instead of to stdout')
  .option('--yml', 'output messages in YAML instead of JSON format')
  .action(function (files, options) {
    files = flattenFiles(files)

    var errors = []
    files.forEach(function (file) {
      if (!existsSync(file)) {
        errors.push(file + ' doesn\'t exist')
      }
    })
    if (errors.length) {
      console.error(errors.join('. '))
      process.exit(2)
    }

    addStdinToFiles(files, options, function () {
      Extractor.extractFromFiles(files, {
        functionName: options.functionName,
        autoDetectFunctionName: options.auto,
        locale: options.locale,
        instructions: options.instructions,
        keyType: options.keyType,
        outFile: options.outFile,
        yml: options.yml
      })
    })
  })

/**
 * format-message inline src/*.js
 *  find and replace message pattern calls in files with translations
 **/
program
  .command('inline [files...]')
  .alias('translate')
  .description('find and replace message pattern calls in files with translations')
  .option('-n, --function-name [name]', 'find function calls with this name [formatMessage]', 'formatMessage')
  .option('--no-auto', 'disables auto-detecting the function name from import or require calls')
  .option('-k, --key-type [type]',
    'derived key from source pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
    'underscored_crc32'
  )
  .option('-l, --locale [locale]', 'BCP 47 language tags specifying the target locale [en]', 'en')
  .option('-t, --translations [path]', 'location of the JSON file with message translations')
  .option('-e, --missing-translation [behavior]',
    'behavior when --translations is specified, but a translated pattern is missing (error | warning | ignore) [error]',
    'error'
  )
  .option('-m, --missing-replacement [pattern]', 'pattern to inline when a translated pattern is missing, defaults to the source pattern')
  .option('-i, --source-maps-inline', 'append sourceMappingURL comment to bottom of code')
  .option('-s, --source-maps', 'save source map alongside the compiled code')
  .option('-f, --filename [filename]', 'filename to use when reading from stdin - this will be used in source-maps, errors etc [stdin]', 'stdin')
  .option('-o, --out-file [out]', 'compile all input files into a single file')
  .option('-d, --out-dir [out]', 'compile an input directory of modules into an output directory')
  .option('-r, --root [path]', 'remove root path for source filename in output directory [cwd]')
  .action(function (files, options) {
    files = flattenFiles(files)

    var errors = []
    files.forEach(function (file) {
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
    if (
      options.missingTranslation !== 'error' &&
      options.missingTranslation !== 'warning' &&
      options.missingTranslation !== 'ignore'
    ) {
      errors.push('--missing-translation must be "error" "warning" or "ignore"')
    }
    if (errors.length) {
      console.error(errors.join('. '))
      process.exit(2)
    }

    addStdinToFiles(files, options, function () {
      Inliner.inlineFiles(files, {
        functionName: options.functionName,
        autoDetectFunctionName: options.auto,
        locale: options.locale,
        keyType: options.keyType,
        translations: options.translations,
        missingTranslation: options.missingTranslation,
        missingReplacement: options.missingReplacement,
        sourceMaps: options.sourceMapsInline ? 'inline' : options.sourceMaps,
        outFile: options.outFile,
        outDir: options.outDir,
        root: options.root || process.cwd()
      })
    })
  })

program
  .parse(process.argv)

if (process.argv.length < 3) {
  program.help()
}
