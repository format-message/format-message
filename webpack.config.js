var webpack = require('webpack'),

	debug = process.argv.indexOf('-d') >= 0 ||
		process.argv.indexOf('--debug') >= 0;

module.exports = {
	cache: true,
	context: __dirname + '/src',
	entry: {
		browser: [
			'./format.js'
		]
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/i,
				exclude: /node_modules/,
				loader: '6to5?loose=all'
			}
		],
		postLoaders: [
			{
				test: /\.js$/,
				exclude: /(test|node_modules)\//,
				loader: 'istanbul-instrumenter'
			}
		]
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/dist',
		publicPath: '/'
	},
	devtool: 'inline-source-map',
	plugins: [/*
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
	*/]
}

