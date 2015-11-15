// Karma configuration
// Generated on Wed Jan 28 2015 19:14:37 GMT-0700 (MST)

const webpackConfig = require('./webpack.config')

module.exports = function (config) {
  var customLaunchers = {
    sl_safari: {
      base: 'SauceLabs',
      browserName: 'safari'
    },
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox'
    },
    sl_ie_10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '10'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '11'
    },
    sl_edge: {
      base: 'SauceLabs',
      browserName: 'microsoftedge'
    }
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [ 'mocha', 'chai' ],

    // list of files / patterns to load in the browser
    files: [
      'test/**/*.spec.js'
    ],

    // list of files to exclude
    exclude: [
      'test/**/*.cli.spec.js',
      'test/eslint/**/*'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': [ 'webpack', 'sourcemap' ]
    },

    webpack: {
      cache: true,
      devtool: '#inline-source-map',
      module: {
        loaders: webpackConfig.module.loaders
      }
    },

    webpackMiddleware: {
      noInfo: true
    },

    client: {
      mocha: {
        timeout: 10000
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'dots' ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: process.env.CONTINUOUS_INTEGRATION
      ? process.env.TRAVIS_NODE_VERSION === 'stable'
        ? Object.keys(customLaunchers) : [ 'Firefox' ]
      : [ 'Chrome', 'Firefox', 'Safari' ],

    customLaunchers: customLaunchers,
    sauceLabs: {
      testName: 'format-message'
    },
    captureTimeout: 120000,
    browserNoActivityTimeout: 60000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: 5
  })
}
