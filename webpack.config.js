let path = require('path')
let webpack = require('webpack')
let CopyWebpackPlugin = require('copy-webpack-plugin')

let config = {};
let output = {};

switch (process.env.NODE_ENV) {
    case 'development':
        config.entry = './src/main.js';
        output.filename = 'build.js',
        output.publicPath = '/dist/';
        output.path = path.resolve(__dirname, './dist');
        break;
    case 'demo':
        config.entry = './src/main.js';
        output.filename = 'haku-scroll.js',
        output.publicPath = '/demo/';
        output.path = path.resolve(__dirname, './demo');
        break;
    case 'production':
        config.entry = './src/plugin/haku-scroll/index.js';
        output.filename = 'haku-scroll.js',
        output.publicPath = '/dist/';
        output.path = path.resolve(__dirname, './dist');
        break;
}

module.exports = {
    output: {
        library: 'haku-scroll',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        ...output
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader?indentedSyntax'
                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader'
                        ],
                        'sass': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader?indentedSyntax'
                        ]
                    }
                    // other vue-loader options go here
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg|ico)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['*', '.js', '.vue', '.json', '.jsx']
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    },
    performance: {
        hints: false
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'public/', force: true }
        ])
    ],
    devtool: '#eval-source-map',
    ...config
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
