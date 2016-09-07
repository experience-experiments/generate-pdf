require('babel-register')({ ignore: /!(generate-pdf\/lib)/ })

module.exports = require('./lib')
