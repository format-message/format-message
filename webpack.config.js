const webpack = require('webpack')

module.exports = {
  cache: true,
  context: __dirname + '/lib',
  devtool: 'source-map',
  entry: {
    browser: [
      './browser.js'
    ]
  },
  module: {
    loaders: []
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]
}
