import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { resolve } from 'path';
import * as webpack from 'webpack';
import { getBabelLoader, webpackIgnore } from '../config/webpack-utils';

const VERSION = JSON.stringify(require('../package.json').version);
const REVISION = JSON.stringify(
  require('child_process').execSync('git rev-parse --short HEAD').toString().trim(),
);

function root(filename) {
  return resolve(__dirname + '/' + filename);
}

export default (_, { mode }) => ({
  entry: [root('../src/polyfills.ts'), root('index.tsx')],
  target: 'web',
  output: {
    filename: 'redoc-demo.bundle.js',
    path: root('dist'),
    globalObject: 'this',
  },

  devServer: {
    static: __dirname,
    port: 9090,
    hot: true,
    historyApiFallback: true,
    open: true,
  },
  stats: {
    children: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: {
      path: require.resolve('path-browserify'),
      http: false,
      fs: false,
      os: false,
    },
    alias:
      mode !== 'production'
        ? {
            'react-dom': '@hot-loader/react-dom',
          }
        : {},
  },

  performance: false,

  externals: {
    esprima: 'esprima',
    'node-fetch': 'null',
    'node-fetch-h2': 'null',
    yaml: 'null',
    'safe-json-stringify': 'null',
  },

  module: {
    rules: [
      { test: [/\.eot$/, /\.gif$/, /\.woff$/, /\.svg$/, /\.ttf$/], use: 'null-loader' },
      {
        test: /\.tsx?$/,
        use: [getBabelLoader({ useBuiltIns: true, hot: true })],
        exclude: {
          and: [/node_modules/],
          not: {
            or: [
              /swagger2openapi/,
              /reftools/,
              /openapi-sampler/,
              /mobx/,
              /oas-resolver/,
              /oas-kit-common/,
              /oas-schema-walker/,
              /\@redocly\/openapi-core/,
              /colorette/,
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __REDOC_VERSION__: VERSION,
      __REDOC_REVISION__: REVISION,
      'process.env': '{}',
      'process.platform': '"browser"',
      'process.stdout': 'null',
    }),
    // new webpack.NamedModulesPlugin(),
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: 'demo/index.html',
    }),
    new ForkTsCheckerWebpackPlugin({ logger: { infrastructure: 'silent', issues: 'console' } }),
    webpackIgnore(/js-yaml\/dumper\.js$/),
    webpackIgnore(/json-schema-ref-parser\/lib\/dereference\.js/),
    webpackIgnore(/^\.\/SearchWorker\.worker$/),
    new CopyWebpackPlugin({
      patterns: ['demo/openapi.yaml', 'demo/sign_request.png'],
    }),
  ],
});
