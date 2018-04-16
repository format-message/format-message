'use strict'

var program = require('commander')
var fsUtil = require('fs')
var pathUtil = require('path')
var glob = require('glob')
var yaml = require('js-yaml')
var lintFiles = require('./lint-files')
var extractFromFiles = require('./extract-files')
var transformFiles = require('./transform-files')
var pkg = require('./package.json')

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

function loadTranslations (file) {
  file = pathUtil.resolve(file)
  try {
    return require(file)
  } catch (err) {
    var data = readFileSync(file, 'utf8')
    return yaml.safeLoad(data)
  }
}

function loadJSONFile (file) {
  file = pathUtil.resolve(file)
  try {
    return require(file)
  } catch (err) {
    var data = readFileSync(file, 'utf8')
    return JSON.parse(data)
  }
}

/**
 * version
 **/
module.exports = program
  .version(pkg.version)

/**
 * format-message lint src/*.js
 *  find message patterns in files and verify there are no obvious problems
 **/
program
  .command('lint [files...]')
  .description('find message patterns in files and verify there are no obvious problems')
  .option('-g, --generate-id [type]',
    'generate missing ids from default message pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
    'literal'
  )
  .option('-l, --locale [locale]', 'BCP 47 language tags specifying the source default locale [en]', 'en')
  .option('-t, --translations [path]',
    'location of the JSON file with message translations,' +
      ' if specified, translations are also checked for errors'
  )
  .option('-f, --filename [filename]', 'filename to use when reading from stdin - this will be used in errors [stdin]', 'stdin')
  .option('-s, --style [style]',
    'error output format (stylish | checkstyle | compact | html | jslint-xml | json | junit | tap | unix) [stylish]',
    'stylish'
  )
  .option('-e, --extends [extends]',
    'sets the rules that are used for linting (default | recommended | customrules) [default]',
    'default')
  .option('-c, --customrules [path]', 'location of the custom rules file')
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
        options.translations = loadTranslations(options.translations)
      } catch (err) {
        errors.push(err.message)
      }
    }
    if (options.extends === 'default') {
      options.extends = [ 'plugin:format-message/default' ]
      options.customrules = null
    } else if (options.extends === 'recommended') {
      options.extends = [ 'plugin:format-message/recommended' ]
      options.customrules = null
    } else if (options.extends === 'customrules') {
      options.extends = null
      if (options.customrules && existsSync(options.customrules)) {
        options.customrules = loadJSONFile(options.customrules)
      } else {
        if (options.customrules) {
          errors.push('A valid file needs to be provided for "customrules". "' + options.customrules + '" is not a valid file.')
        } else {
          errors.push('When "customrules" is specified for "extends", a valid path has to be provided for "customrules".')
        }
        options.customrules = null
      }
    } else {
      errors.push('A valid extends value [default, recommended, customrules] needs to be provided. "' + options.extends + '" is not valid.')
    }

    if (errors.length) {
      console.error(errors.join('. '))
      return process.exit(2)
    }

    addStdinToFiles(files, options, function () {
      lintFiles(files, {
        style: options.style,
        locale: options.locale,
        generateId: options.generateId,
        translations: options.translations,
        extends: options.extends,
        customrules: options.customrules
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
  .option('-g, --generate-id [type]',
    'generate missing ids from default message pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
    'literal'
  )
  .option('-l, --locale [locale]', 'BCP 47 language tags specifying the source default locale [en]', 'en')
  .option('-f, --filename [filename]', 'filename to use when reading from stdin - this will be used in errors', 'stdin')
  .option('-o, --out-file [out]', 'write messages to this file instead of to stdout')
  .option('--format [format]',
    'use the specified format instead of detecting from the --out-file extension (yaml | es6 | commonjs | json)'
  )
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
      return process.exit(2)
    }

    addStdinToFiles(files, options, function () {
      extractFromFiles(files, {
        generateId: options.generateId,
        locale: options.locale,
        outFile: options.outFile,
        format: options.format
      })
    })
  })

/**
 * format-message transform src/*.js
 *  transform formatMessage calls either adding generated ids or inlining and optimizing a translation
 **/
program
  .command('transform [files...]')
  .description('transform formatMessage calls either adding generated ids or inlining and optimizing a translation')
  .option('-g, --generate-id [type]',
    'generate missing ids from default message pattern (literal | normalized | underscored | underscored_crc32) [underscored_crc32]',
    'literal'
  )
  .option('-i, --inline', 'inline the translation for the specified locale')
  .option('-l, --locale [locale]', 'BCP 47 language tags specifying the target locale [en]', 'en')
  .option('-t, --translations [path]', 'location of the JSON file with message translations')
  .option('-e, --missing-translation [behavior]',
    'behavior when --translations is specified, but a translated pattern is missing (error | warning | ignore) [error]',
    'error'
  )
  .option('-m, --missing-replacement [pattern]', 'pattern to inline when a translated pattern is missing, defaults to the source pattern')
  .option('--source-maps-inline', 'append sourceMappingURL comment to bottom of code')
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
        options.translations = loadTranslations(options.translations)
      } catch (err) {
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
      return process.exit(2)
    }

    addStdinToFiles(files, options, function () {
      transformFiles(files, {
        generateId: options.generateId,
        inline: options.inline,
        locale: options.locale,
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
