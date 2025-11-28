const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'web',
    entry: {
        main: ['process/browser', './index.tsx']
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.wasm', '.scss'],
        fallback: {
            process: require.resolve('process/browser'),
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    ],
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
    },
    module: {
        rules: [
            {
              test: /\.(ts|tsx|js|mjs|cjs)$/,
              loader: 'babel-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.wasm$/,
              type: 'asset/resource',
            },
            {
              test: /\.module\.scss$/,
              use: [
                'style-loader',
                {
                  loader: 'css-loader',
                  options: {
                    modules: true, // Enable CSS Modules
                    sourceMap: true, // Optional, enable for easier debugging
                    importLoaders: 1, // Allow SCSS imports in CSS
                    modules: {
                      localIdentName: '[local]__[hash:base64:5]', // Correct way to define the custom class name format
                    }
                  },
                },
                'sass-loader', // Compile SCSS to CSS
              ]
            },
            {
              test: /\.scss$/, // To handle regular SCSS files if needed
              use: [
                'style-loader',
                'css-loader',
                'sass-loader',
              ],
              exclude: /\.module\.scss$/, // Exclude .module.scss from this rule
            }
          ],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true,
        assetModuleFilename: '[name][ext]'
    }  
};