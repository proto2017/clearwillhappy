

var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    devtool: 'cheap-eval-source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/dev-server',
        './app/main'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        })
    ],
    module: {
        loaders: [{
            test: /\.css$/,
            loaders: ['style', 'css']
        }, {
            test: /\.html$/,
            loader: "html-withimg-loader" // loaders: ['raw-loader'] is also perfectly acceptable.
        }, {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=es2015'
        }, { test: /\.(png|jpg)$/,  exclude: /node_modules/, loader: 'url-loader?limit=8192'}]  // 小于8KB的图片使用base64内联]
    },
    devServer: {
        contentBase: './dist',
        hot: true
    }
}