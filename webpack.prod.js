const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

APP_ENV = 'production'

process.env.APP_ENV = APP_ENV

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new HtmlWebpackPlugin({
          template: './public/index.html',
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.resolve(__dirname, 'src/rlottie'),
              to: path.resolve(__dirname, 'dist'),
            },
            {
               from: path.resolve(__dirname, 'public/telegram-web-app.js'),
               to: path.resolve(__dirname, 'dist'),
            }
          ],
        }),
    ],
});