const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WextManifestWebpackPlugin = require("wext-manifest-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV || 'development';
const VIEWS_PATH = path.join(__dirname, 'src', 'views');
const DIST_PATH = path.join(__dirname, 'dist', NODE_ENV);
const { TARGET_BROWSER } = process.env;

const getExtensionFileType = (browser) => {
  if (browser === 'opera') {
    return 'crx';
  }

  if (browser === 'firefox') {
    return 'xpi';
  }

  return 'zip';
};

module.exports = {
  devtool: 'inline-source-map',

  mode: NODE_ENV,

  entry: {
    manifest: "./src/manifest.json",
    background: './src/background/index.ts',
    popup: './src/views/popup/index.tsx',
  },

  output: {
    path: path.join(DIST_PATH, TARGET_BROWSER),
    filename: '[name].bundle.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'webextension-polyfill': 'webextension-polyfill',
    },
  },

  module: {
    rules: [
      {
        type: "javascript/auto",
        test: /manifest\.json$/,
        use: {
          loader: "wext-manifest-loader",
          options: {
            usePackageJSONVersion: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new WextManifestWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(VIEWS_PATH, 'popup/popup.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'popup.html',
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), 'dist', NODE_ENV, TARGET_BROWSER),
        path.join(
          process.cwd(),
          'dist',
          NODE_ENV,
          `${TARGET_BROWSER}.${getExtensionFileType(TARGET_BROWSER)}`,
        ),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: 'zip',
                source: path.join(DIST_PATH, TARGET_BROWSER),
                destination: `${path.join(
                  DIST_PATH,
                  TARGET_BROWSER,
                )}.${getExtensionFileType(TARGET_BROWSER)}`,
                options: { zlib: { level: 6 } },
              },
            ],
          },
        },
      }),
    ],
  },
};