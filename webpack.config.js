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
  // The default for development is cheap-module-eval-source-map, which causes
  // CORS problems when displaying JavaScript errors in Chrome.
  devtool: isProduction
    ? 'hidden-source-map'
    : 'inline-cheap-module-source-map',
};
