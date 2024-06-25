const webpack = require('webpack');
const {globSync} = require("glob");
const path = require("path");
const fs = require("fs");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const frp = require("mmhk-frp");
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const http = require('http');
const fontpath = require('postcss-fontpath');

const FRP_ENDPOINT = process.env.FRP_ENDPOINT || 'localhost';
const FRP_ENDPOINT_PORT = process.env.FRP_ENDPOINT_PORT || 7000;
const FRP_API_PORT = process.env.FRP_ENDPOINT_PORT || 7001;
const FRP_API_USER = process.env.FRP_API_USER || 'admin';
const FRP_API_PWD = process.env.FRP_API_PWD || 'admin';
const FRP_PUBLIC_DOMAIN = process.env.FRP_PUBLIC_DOMAIN || 'localhost';
const isDevServer = process.env.WEBPACK_DEV_SERVER || process.env.WEBPACK_SERVE;

const checkSubDomainExist = (domain) => {
	const auth = `${FRP_API_USER}:${FRP_API_PWD}`;

	return new Promise((resolve, reject) => {
		const req = http.get({
			hostname: FRP_ENDPOINT,
			port: FRP_API_PORT,
			path: '/api/proxy/http',
			headers: { 'Content-Type': 'application/json' },
			auth: auth,
		}, (resp) => {
			resp.setEncoding('utf8');
			let data = '';

			// A chunk of data has been received.
			resp.on('data', (chunk) => {
				data += chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				let json = {};
				try {
					json = JSON.parse(data);
					resolve(json);
				} catch (err) {
					reject(err)
				}
			});

		});
		req.on('error', (err) => {
			console.error(`http error: ${err}`);
			reject(err);
		});
		req.end();
	})
		.then((data) => {
			const list = Array.from(data.proxies || []);
			if (list.find((row) => {
				return row.name === domain && row.status === 'online';
			})) {
				return Promise.resolve(true);
			}

			return Promise.resolve(false);
		})
}

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FontminPlugin = require('./src/webpack/fontmin-webpack.js');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin-webpack5');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

const HTMlEntryList = globSync("./src/*.html").map((ele) => {
	return new HtmlWebpackPlugin({
		filename: path.basename(ele),
		template: ele,
		hash: false,
		excludeAssets: [/\.js/]
	})
});

const getFontmin = () => {
	let charList = globSync("src/*.{html,shtml}").map((file) => {
		return fs.readFileSync(file)
	})

	return new FontminPlugin({
		autodetect: false, // automatically pull unicode characters from CSS
		glyphs: Buffer.concat(charList).toString('utf-8').split(""),
	})
};

const config = {
	mode: 'development',
	entry: ['./src/main.js','./src/css/print.css'],

	output: {
		path: path.resolve(__dirname, 'dist'),
		publicPath: "auto",
		clean: true,
	},

	plugins: [
		new webpack.ProgressPlugin(),

		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// all options are optional
			filename: 'css/[name].css',
			chunkFilename: 'css/[id].css',
			ignoreOrder: false, // Enable to remove warnings about conflicting order
		}),

		new CleanWebpackPlugin(),

		getFontmin(),

	].concat(HTMlEntryList, [
		new HTMLInlineCSSWebpackPlugin(),
		new HtmlInlineScriptPlugin()
	]),

	module: {
		rules: [
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: {
							sources: {
								urlFilter: (attribute, value, resourcePath) => {
									if (/\.js/.test(value)) {
										return false;
									}
									return true;
								}
							}
						}
					},
				]
			},
			{
				test: /.(js)$/,
				include: [
					path.resolve(__dirname, 'src'),
				],
				exclude: /(node_modules|webpack)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							plugins: [
								[
									"@babel/plugin-transform-template-literals", {
									loose: true
								}],
								"@babel/plugin-transform-runtime",
								"@babel/plugin-syntax-dynamic-import"
							],

							presets: [
								[
									'@babel/preset-env',
									{
										modules: false,
										useBuiltIns: "usage",
										corejs: 3
									}
								]
							]
						}
					},
				],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/i,
				type: 'asset',
				generator: {
					filename: 'assets/fonts/[hash][ext][query]'
				},
				parser: {
					dataUrlCondition: {
						maxSize: 2 * 1024 * 1024 // 2mb
					}
				},
			},
			{
				test: /\.(|png|jpe?g|gif)$/i,
				type: 'asset',
				generator: {
					filename: 'assets/img/[hash][ext][query]'
				},
				parser: {
					dataUrlCondition: {
						maxSize: 2 * 1024 * 1024, // 2mb 以下的文件将被内联
					},
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									["autoprefixer"],
									fontpath({
										formats: [
											{ type: 'woff2', ext: 'woff2' },
											{ type: 'embedded-opentype', ext: 'eot' },
											{ type: 'woff', ext: 'woff' },
											{ type: 'svg', ext: 'svg'},
										],
									}),
								],
							},
							sourceMap: true,
						}
					},
				],
			},
		]
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				default:{
					name: "home",
					chunks: 'all',
					reuseExistingChunk: true,
					priority: 10,
				},
			}
		},
		minimizer: [
			new CssMinimizerPlugin({
				minimizerOptions: {
					preset: [
						'default',
						{
							mergeLonghand: false,
							cssDeclarationSorter: false,
							discardComments: { removeAll: true },
						}
					]
				},
			}),
			new ImageMinimizerPlugin({
				minimizer: {
					implementation: ImageMinimizerPlugin.sharpMinify,
					options: {
						encodeOptions: {
							jpeg: {
								// https://sharp.pixelplumbing.com/api-output#jpeg
								quality: 100,
							},
							webp: {
								// https://sharp.pixelplumbing.com/api-output#webp
								lossless: true,
							},
							avif: {
								// https://sharp.pixelplumbing.com/api-output#avif
								lossless: true,
							},

							// png by default sets the quality to 100%, which is same as lossless
							// https://sharp.pixelplumbing.com/api-output#png
							png: {},

							// gif does not support lossless compression at all
							// https://sharp.pixelplumbing.com/api-output#gif
							gif: {},
						},
					},
				},
			}),
			new TerserWebpackPlugin({
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
					compress: {
						drop_console: true, // 移除 console.log 语句
					},
				},
			}),
		],

		minimize: process.env.NODE_ENV !== 'development',
	},

	devtool: "source-map",
	// watch: process.env.NODE_ENV === 'development',
	watchOptions: {
		ignored: /(node_modules|webpack)/
	},
	devServer: {
		open: true,
		compress: true,
		allowedHosts: [
			"localhost",
			".demo2.mixmedia.com",
		],
	}
};

if (!isDevServer) {
	module.exports = config;
	return;
}

module.exports = prompt([
	{
		type: 'list',
		name: 'public',
		message: '请问是否允外网访问',
		choices: [
			{
				name: "允许",
				value: true
			},
			{
				name: "不需要",
				value: false
			},
		],
	},
	{
		type: 'input',
		name: 'subdomain',
		message: '请配一个霸气的域名',
		validate: (input) => {
			return /^([a-z0-9\-]{4,})$/i.test(input);
		},
		when: ({public}) => {
			return public;
		}
	},
]).then(({public, subdomain}) => {
	return Promise.resolve({
		...config,
		devServer: {
			...config.devServer,
			client: !public ? {} : {
				webSocketURL: `https://${subdomain}.${FRP_PUBLIC_DOMAIN}/ws`,
			},
			open: !public ? true : {
				target: `https://${subdomain}.${FRP_PUBLIC_DOMAIN}`,
			},
			allowedHosts: [
				`.${FRP_PUBLIC_DOMAIN}`,
			],
			onListening: (devServer) => {
				if (!devServer) {
					throw new Error('webpack-dev-server is not defined');
				}
				if (!public) {
					return;
				}
				const addr = devServer.server.address();

				console.log('set domain:', subdomain);

				checkSubDomainExist(subdomain)
					.then((exist) => {
						if (!exist) {
							let conf = {
									common: {
										serverPort: FRP_ENDPOINT_PORT,
										serverAddr: FRP_ENDPOINT,
									},
								};
							conf[subdomain] = {
								type: "http",
								localIp: "127.0.0.1",
								localPort: addr.port,
								subdomain,
							};

							return frp.startClient(conf);
						}
						return Promise.reject(new Error('已经有人使用此霸气的名字'));
					})
					.catch((err) => {
						console.error(err);
						return Promise.reject(err);
					})
			},
		}
	})
})
