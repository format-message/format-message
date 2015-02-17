var webpack = require('webpack')

module.exports = {
	cache: true,
	context: __dirname + '/src',
	devtool: 'source-map',
	entry: {
		browser: [
			'./browser.js'
		]
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/i,
				exclude: /node_modules/,
				loader: 'babel?loose=all'
			}
		]
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		publicPath: '/'
	},
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	]
}

