const path = require('path');
const webpack = require('webpack');

APP_ENV = 'development'
IS_PACKAGED_ELECTRON = false
BASE_URL = 'blabla'
ELECTRON_HOST_URL = "blabla"

const CSP = `
  default-src 'self';
  connect-src 'self' wss://*.web.telegram.org blob: http: https: ${APP_ENV === 'development' ? 'wss:' : ''};
  script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://t.me/_websync_ https://telegram.me/_websync_;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://autostatus.nashruz.uz data:;
  ${IS_PACKAGED_ELECTRON ? `${BASE_URL}/` : ''};
  media-src 'self' blob: data: https://autostatus.nashruz.uz;
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
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false
                        }
                    },
                    'sass-loader'
                ]
            }
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