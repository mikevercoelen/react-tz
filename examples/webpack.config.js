const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const env = process.env.NODE_ENV

const rules = []

rules.push({
  test: /\.js$/,
  loader: 'babel-loader',
  exclude: /node_modules/
})

rules.push({
  test: /\.scss$/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        sourceMap: true,
        modules: {
          localIdentName: '[name]-[local]-[hash:base64:5]'
        }
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        config: {
          path: './scripts/webpack/postcss.config.js'
        }
      }
    },
    {
      loader: 'sass-loader'
    }
  ]
})

rules.push({
  test: /\.(ico|jpg|jpeg|png|gif|svg)(\?.*)?$/,
  use: [
    {
      loader: 'file-loader',
      query: {
        name: '[hash:8].[ext]'
      }
    },
    {
      loader: 'img-loader',
      query: {
        options: {
          enabled: true
        }
      }
    }
  ]
})

const config = {
  context: __dirname,
  mode: 'development',
  entry: './index.js',
  module: {
    rules
  },
  output: {
    path: path.resolve(__dirname, '../dist-examples')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}

module.exports = config
