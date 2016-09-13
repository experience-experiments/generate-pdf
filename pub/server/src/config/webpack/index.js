const path = require('path')
const webpack = require('webpack')

const processCwd = process.cwd()
const clientPath = path.resolve(processCwd, 'pub/client')
const assetsPath = path.resolve(processCwd, 'pub/public/assets/js')

module.exports = {
  context: processCwd,
  devtool: 'source-map',
  entry: {
    index: [
      path.join(clientPath, 'src/app.js')
    ]
  },
  output: {
    path: assetsPath,
    filename: '[name].js',
    publicPath: assetsPath
  },
  node: {
    fs: 'empty'
  },
  module: {
    loaders: [
      /*
       *  For JSON
       */
      {
        test: /\.json$/,
        loader: 'json'
      },
      /*
       *  For JS/ES (except ...)
       */
      {
        test: /\.js?$/,
        loader: 'babel',
        exclude: /node_modules\/(?!(express-hogan-cache|hogan-cache)).*/,
        query: {
          compact: true,
          presets: [
            'es2015',
            'react',
            'stage-0',
            'stage-1'
          ],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread',
            'transform-runtime',
            'transform-react-jsx'
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      preserveComments: false
    })
  ]
}
