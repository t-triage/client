const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const fs = require('fs');
const yaml = require("js-yaml")

module.exports = (env, options) => {
    var config = ""
    config = yaml.load(fs.readFileSync("config.yml", "utf8"))
    return {
        entry: ["babel-polyfill", "./src/App.js"],
        output: {
            path: path.resolve(__dirname, 'build/'),
            filename: 'app-bundle.js',
            publicPath: '/'
        },
        devServer: {
            port: 8080,
            historyApiFallback: true
        },
        module: {
            rules: [
                { test: /\.jsx?$/, exclude: /node_modules/, use: ['babel-loader'] },
                { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
                { test: /\.(jpg|png|gif|svg|ico|eot|svg|ttf|woff2?)$/, use: [
                        { loader: 'file-loader', options: { name: '[path][name]-[hash:8].[ext]'}}
                    ]
                }
            ]
        },
        plugins : [
            new HtmlWebPackPlugin({
                template: 'src/index.html',
                favicon: './src/images/favicon.png'
            }),
            //Set ENV VARS
            new webpack.DefinePlugin({"process.env.CONFIG": options.mode === "development" ? JSON.stringify(config) : null})
        ]
    }
}
