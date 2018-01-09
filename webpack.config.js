const path = require('path')
const UglifyJS = require('uglifyjs-webpack-plugin')
const ExtractText = require('extract-text-webpack-plugin')
const Manifest = require ('webpack-manifest-plugin')
const Clean = require('clean-webpack-plugin')
const HtmlWebpack = require('html-webpack-plugin')
const dev = process.env.NODE_ENV === 'dev'

let cssLoaders = [
	{
		loader: 'css-loader', 
		options: { importLoaders: 1, minimize: !dev }
	}
]

if(!dev){
	cssLoaders.push({
		loader: 'postcss-loader',
		options: {
			ident: 'postcss',
			plugins: (loader) => [
				require('autoprefixer')()
			]
		}
	})
}

let config = {
	devtool: dev ? "cheap-module-eval-source-map" : false,
	devServer: {
		overlay: true,
		contentBase: path.resolve('./dist')
	},
	watch: dev,
	entry: {
		app: ['./assets/css/app.scss','./assets/js/app.js']
	},
	output: {
		path: path.resolve('./dist/assets'),
		filename: dev ? '[name].js' : '[name].[chunkhash:8].js',
		publicPath: '/'
	},
	resolve: {
		alias: {
			'@': path.resolve('./assets/'),
			'@js': path.resolve('./assets/js/'),
			'@css': path.resolve('./assets/css/'),
		}
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test:/\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: ['eslint-loader']
			},{
				test:/\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: ['babel-loader']
			},{
				test:/\.css$/,
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: cssLoaders
				})
			},{
				test:/\.scss$/,
				use: ExtractText.extract({
					fallback: 'style-loader',
					use: [...cssLoaders, 'sass-loader']
				})
			},{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'file-loader'
			},{
				test: /\.(png|jpg|gif|svg)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
							name:'[name].[hash:8].[ext]'
						}
					},{
						loader: 'img-loader',
						options: {
							enabled: !dev
						}
					}
				]
			  }
		]
	},

	plugins: [
		new ExtractText({
			filename: dev ? '[name].css' : '[name].[contenthash:8].css',
			disable: dev
		}),
		new HtmlWebpack({
			template: 'index.html'
		})
	]
}

if(!dev){
	config.plugins.push(new UglifyJS({
		sourceMap: false
	}))
	config.plugins.push(new Manifest())
	config.plugins.push(new Clean(['dist'],{
		root: path.resolve('./'),
		verbose: true,
		dry: false
	}))
}

module.exports = config