const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer')

const isDevelopment = process.env.NODE_ENV !== 'production';

APP_ENV = 'development'

const CSP = `
  default-src 'self';
  connect-src 'self' wss://*.web.telegram.org blob: http: https: ${APP_ENV === 'development' ? 'wss:' : ''};
  script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://t.me/_websync_ https://telegram.me/_websync_ https://telegram.org;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://autostatus.nashruz.uz https://overly-boss-kangaroo.ngrok-free.app blob: data:;
  media-src 'self' blob: data: https://autostatus.nashruz.uz https://overly-boss-kangaroo.ngrok-free.app;
  object-src 'none';
  frame-src http: https:;
  base-uri 'none';
  form-action 'none';`
    .replace(/\s+/g, ' ').trim();

module.exports = {
    mode: 'development',
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
    },
    devServer: {
        port: 1234,
        host: '0.0.0.0',
        allowedHosts: 'all',
        hot: true,
        static: [{
            directory: path.join(__dirname, 'public'),
            publicPath: '/',
        },
        {
            directory: path.join(__dirname, 'src/rlottie'),
            publicPath: '/',
        }],
        historyApiFallback: true,
        compress: true,
        devMiddleware: {
            writeToDisk: true,
        },
        headers: {
            'Content-Security-Policy': CSP,
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        },
    }
};