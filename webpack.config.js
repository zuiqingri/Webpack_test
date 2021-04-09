const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const webpackMode = process.env.NODE_ENV || 'development';

module.exports = {
	mode: webpackMode,
	entry: {
		main: './src/main.js',
	},
	output: {
		path: path.resolve('./dist'),
		filename: '[name].js'
	},
	// es5로 빌드 해야 할 경우 주석 제거
	// 단, 이거 설정하면 webpack-dev-server 3번대 버전에서 live reloading 동작 안함
	// target: ['web', 'es5'],
	devServer: {
		overlay: true,
		stats: 'errors-only',
		liveReload: true
	},
	optimization: {
		minimizer: webpackMode === 'production' ? [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: true
					}
				}
			})
		] : [],
		splitChunks: {
			chunks: 'all'
		}
	},
	// externals: {
		// 빌드 과정에서 제외하고 그대로 사용할 패키지 지정
		// 예시 - foo라는 이름의 모듈이라면 아래처럼 입력
		// foo: "foo"
	// },
	module: {
		rules: [
			{
				test: /\.(css|scss)$/,
				use: [
					process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'url-loader',
				options: {
					name: '[name].[ext]?[hash]',
					limit: 10000,
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				use: ['source-map-loader'],
			}
		]
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: `
				LICENSE.txt에 출력할 내용
			`
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			minify: process.env.NODE_ENV === 'production' ? {
				collapseWhitespace: true,
				removeComments: true,
			} : false
		}),
		new CleanWebpackPlugin(),
		...(process.env.NODE_ENV === 'production'
			? [new MiniCssExtractPlugin({ filename: '[name].css' })]
			: []
		),
		// 빌드 될 js에 포함시키지 않고 그대로 가져와서 쓰는 파일은 아래처럼 설정하고, HTML에도 직접 넣어주세요
		// new CopyPlugin({
		// 	patterns: [
		// 		{ from: "./src/ext/modernizr.js", to: "./modernizr.js" },
		// 	],
		// })
	]
};