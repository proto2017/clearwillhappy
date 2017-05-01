var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    devtool: 'source-map',
    entry: ['./app/main'],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false,
            },
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    module: {
        loaders:[{
            test: /\.css$/,
            loaders: ['style', 'css']
        }, {
            test: /\.html$/,
            loader: "html-withimg-loader" // loaders: ['raw-loader'] is also perfectly acceptable.
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?presets[]=es2015'
        }, { test: /\.(png|jpg)$/,  exclude: /node_modules/, loader: 'url-loader?limit=8192'}]
    }
}