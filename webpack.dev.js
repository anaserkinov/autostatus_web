const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const path = require('path');

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

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
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
    },
    
});