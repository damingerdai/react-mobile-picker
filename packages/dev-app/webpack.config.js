const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log(path.join(__dirname, '..', 'react-mobile-picker'), path.join(__dirname), path.join(__dirname, 'index.html'));

module.exports = {
  mode: 'development',
  entry: [
    path.join(__dirname, 'src', 'main.js')
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    }
  },
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|dist)/,
        use: [
          'babel-loader',
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     presets: ['@babel/preset-env','@babel/preset-react'],
          //     plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties']
          //  }
          // }
        ]
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          // compiles Less to CSS
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              modules: true
            }
          },
          // {
          //   loader: "style-loader"
          // },
          {
            loader: "less-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'react-mobile-picker': path.join(__dirname, '..', 'react-mobile-picker'),
      'react-dom': '@hot-loader/react-dom',
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template:  path.join(__dirname, 'public', 'index.html')
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    })
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin()
  ]
};
