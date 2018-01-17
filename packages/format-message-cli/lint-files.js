'use strict'

var fs = require('fs')
var CLIEngine = require('eslint').CLIEngine

module.exports = function extractFiles (files, options) {
  var baseConfig = {
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true,
      jsx: true
    },
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'module'
    },
    plugins: [ 'format-message' ],
    settings: {
      'format-message': {
        sourceLocale: options.locale,
        generateId: options.generateId,
        translations: options.translations
      }
    }
  }
  // This conditionally adds either the extends or rules config option.
  // Both can not be set as rules always overrides extends even if rules does
  // not have a valid value.
  if (options.extends) {
    baseConfig.extends = options.extends
  }
  if (options.customrules) {
    baseConfig.rules = options.customrules
  }
  var cli = new CLIEngine({
    useEslintrc: false,
    envs: [ 'es6', 'browser', 'node' ],
    baseConfig: baseConfig
  })

  var report = {
    results: [],
    errorCount: 0,
    warningCount: 0
  }
  forEachFile(files, function (source) {
    var subreport = cli.executeOnText(source.sourceCode, source.sourceFileName)
    report.results = report.results.concat(subreport.results)
    report.errorCount += subreport.errorCount
    report.warningCount += subreport.warningCount
  })
  var format = cli.getFormatter(options.style)
  var formatted = format(report.results)
  if (formatted) console.error(formatted)
  process.exit(report.errorCount)
}

function forEachFile (files, fn) {
  files.map(function (file) {
    var source = file
    if (typeof file === 'string') {
      source = {
        sourceFileName: file,
        sourceCode: fs.readFileSync(file, 'utf8')
      }
    }
    return source
  }).forEach(fn)
}
