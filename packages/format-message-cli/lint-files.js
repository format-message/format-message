'use strict'

var fs = require('fs')
var CLIEngine = require('eslint').CLIEngine

module.exports = function extractFiles (files, options) {
  var cli = new CLIEngine({
    useEslintrc: false,
    parser: 'babel-eslint',
    plugins: [ 'format-message' ],
    rules: {
      'format-message/literal-locale': 1,
      'format-message/literal-pattern': 1,
      'format-message/no-identical-translation': 1,
      'format-message/no-invalid-pattern': 2,
      'format-message/no-invalid-translation': 2,
      'format-message/no-missing-params': [ 2, { 'allowNonLiteral': true } ],
      'format-message/no-missing-translation': 1,
      'format-message/translation-match-params': 2
    },
    baseConfig: {
      settings: {
        'format-message': {
          sourceLocale: options.locale,
          generateId: options.generateId,
          translations: options.translations
        }
      }
    }
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
