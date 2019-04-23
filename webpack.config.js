const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: process.env.NODE_ENV === 'development'
      }
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 2,
        sourceMap: true,
        modules: true,
        localIdentName: '[name]-[local]-[hash:base64:5]'
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

const config = {
  mode: env,
  externals: {
    'react': 'react',
    'react-dom': 'reactDOM',
    'react-select': 'ReactSelect',
    'moment': 'moment',
    'moment-timezone': 'moment-timezone'
  },
  module: {
    rules
  },
  output: {
    library: 'ReactTz',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env)
    }),
    new MiniCssExtractPlugin({
      filename: 'react-tz.css'
    })
  ]
}

module.exports = config
