const path = require('path');

const isProduction = process.argv.includes('-p');

module.exports = {
  entry: './js/index.js',
  output: {
    filename: 'menu.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    jquery: 'jQuery',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'js'),
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/env', {
                  targets: {
                    browser: true,
                  },
                }],
              ],
              plugins: [
                '@babel/transform-runtime',
              ],
            },
          },
        ],
      },
    ],
  },
  // The default for development is cheap-module-eval-source-map, which causes
  // CORS problems when displaying JavaScript errors in Chrome.
  devtool: isProduction
    ? 'hidden-source-map'
    : 'inline-cheap-module-source-map',
};
