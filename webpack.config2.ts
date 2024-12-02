import 'webpack-dev-server';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import path from 'path';
import webpack from 'webpack';

const {
  HEAD,
  APP_ENV = 'production',
  APP_MOCKED_CLIENT = '',
  IS_PACKAGED_ELECTRON,
} = process.env;

const CSP = `
  default-src 'self';
  connect-src 'self' wss://*.web.telegram.org blob: http: https: ${APP_ENV === 'development' ? 'wss:' : ''};
  script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://t.me/_websync_ https://telegram.me/_websync_ https://telegram.org;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://autostatus.nashruz.uz https://overly-boss-kangaroo.ngrok-free.app;
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
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[name].[chunkhash].css',
            ignoreOrder: true,
          }),
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
                test: /\.css$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  {
                    loader: 'css-loader',
                    options: {
                      importLoaders: 1,
                      modules: {
                        namedExport: false,
                        auto: true,
                      },
                    },
                  },
                  'postcss-loader',
                ],
              },
              {
                test: /\.scss$/,
                use: [
                  MiniCssExtractPlugin.loader,
                  {
                    loader: 'css-loader',
                    options: {
                      modules: {
                        namedExport: false,
                        exportLocalsConvention: 'camelCase',
                        auto: true,
                        localIdentName: APP_ENV === 'production' ? '[sha1:hash:base64:8]' : '[name]__[local]',
                      },
                    },
                  },
                  'postcss-loader',
                  'sass-loader',
                ],
              },
        ]
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
            directory: path.join(__dirname, 'animated_sticker/src/rlottie'),
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