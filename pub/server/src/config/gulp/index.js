
const path = require('path')
const processCwd = process.cwd()
const clientPath = path.resolve(processCwd, 'pub/client')
const serverPath = path.resolve(processCwd, 'pub/server')
const configPath = path.resolve(serverPath, 'src/config')

module.exports = {
  jshint: {
    all: [
      path.join(clientPath, 'app/**/*.js'),
      path.join(clientPath, 'src/app.js'),
      path.join(clientPath, 'lib/**/*.js')
    ]
  },
  webpack: {
    run: require(path.join(configPath, 'webpack'))
  }
}
