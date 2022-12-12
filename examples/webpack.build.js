var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    path.join(__dirname, 'main.js')
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[hash].app.js'
  },

  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|dist)/,
        loader: 'babel-loader',
        
      },
      {
        test: /\.less$/i,
        use: [
          // compiles Less to CSS
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
    ]
  },

  resolve: {
    alias: {
      'react-mobile-picker': path.join(__dirname, '..', 'src')
    }
  },

  plugins: [
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
};
