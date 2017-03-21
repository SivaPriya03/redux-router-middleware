var webpack = require('webpack')

var config = {
  entry: './src/index',
  module: {
    loaders: [
      { test: /\.js$/, loaders: [ 'babel-loader' ], exclude: /node_modules/ }
    ]
  },
  output: {
    library: 'ReactRouterRedux',
    libraryTarget: 'umd'
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  )
}

module.exports = config
