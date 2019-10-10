var webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    './web/main.js',
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          hotReload: true,
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'quasar-framework': 'quasar-framework/dist/quasar.mat.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist'
  },
}