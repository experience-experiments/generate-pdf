const path = require('path')
const express = require('express')
const http = require('http')

const processCwd = process.cwd()
const serverPath = path.resolve(processCwd, 'pub/server')
const publicPath = path.resolve(processCwd, 'pub/public')

const layoutPath = path.join(serverPath, 'app/react/views')
const assetsPath = path.join(publicPath, 'assets')

const app = express()
const router = require('./router')
const server = http.createServer(app)

app.set('views', layoutPath)
app.set('view engine', 'pug')

app.use('/assets', express.static(assetsPath))
app.use('/', router)
app.use((req, res) => res.redirect('/')) // 404

module.exports = {
  start: function (port) {
    app.set('port', port)
    server.listen(port, '0.0.0.0')
    server.on('error', (e) => console.log(e))
    server.on('listening', () => console.log(`[RMA Generate PDF (React)] ${port}`))
  }
}
