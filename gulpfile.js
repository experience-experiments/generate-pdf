/* eslint promise/param-names: 0 */

/*
 *  Ensure ENV
 */
require('dotenv').config({ path: 'pub/.env' })

const fs = require('fs-extra')

const path = require('path')
const gulp = require('gulp')
const clean = require('gulp-clean')
const webpack = require('webpack-stream')
const uglify = require('gulp-uglify')
const server = require('gulp-develop-server')
const sourcemaps = require('gulp-sourcemaps')
const clientPath = path.resolve(__dirname, 'pub/client')
const serverPath = path.resolve(__dirname, 'pub/server')
const publicPath = path.resolve(__dirname, 'pub/public')
const srcPath = path.join(clientPath, 'src')
const assetsPath = path.join(publicPath, 'assets')
const configPath = path.join(serverPath, 'src/config')
const config = require(path.join(configPath, 'gulp'))

const getFileData = (axios) => (`/* eslint-disable */
global.AXIOS = ${JSON.stringify(axios)}`)

const ensure = (p) => (
  new Promise((success, failure) => {
    fs.ensureDir(p, (e) => {
      if (e) return failure(e)
      success(p)
    })
  })
)

const writeFile = (p, f) => (
  new Promise((success, failure) => {
    fs.writeFile(p, f, (e) => {
      if (e) return failure(e)
      success(p)
    })
  })
)

gulp
  .task('default', ['clean', 'config', 'webpack', 'uglify', 'watch', 'server', 'watch-server'], () => {
    console.log('[RMA Generate PDF]')
  })
  .task('start', ['clean', 'config', 'webpack', 'uglify'], () => {
    console.log('[RMA Generate PDF (Start)]')
  })
  .task('clean', () => {
    return gulp.src(path.resolve(assetsPath, 'js/app/**/*.*'), { read: false })
      .pipe(clean())
  })
  .task('config', (next) => {
    const {
      API_PROTOCOL,
      API_HOST,
      API_PORT,
      API_BASEURL,
      API_VERSION
    } = process.env

    global.AXIOS = {
      API_PROTOCOL,
      API_HOST,
      API_PORT,
      API_BASEURL,
      API_VERSION
    }

    const p = path.join(clientPath, 'src/config')

    const filePath = path.join(p, 'index.js')
    const fileData = getFileData(global.AXIOS)

    ensure(p)
      .then(() => writeFile(filePath, fileData))
      .then(() => next())
      .catch((e) => next(e))
  })
  .task('webpack', () => {
    return gulp.src([])
      .pipe(webpack(config.webpack.run))
      .pipe(gulp.dest(path.resolve(assetsPath, 'js/app/')))
  })
  .task('uglify', () => {
    return gulp.src(path.resolve(srcPath, '**/*.js!src/app.js'))
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(path.resolve(assetsPath, 'js/lib/')))
  })
  .task('watch', () => {
    gulp
      .watch(config.jshint.all, ['clean', 'webpack'])
    gulp
      .watch(path.resolve(serverPath, 'app/mvc/views/**/*.*'), server.restart)
  })
  .task('server', () => {
    server.listen({ path: 'pub/app', args: ['--react', '5002', '--hogan', '5003'] })
  })
  .task('watch-server', () => {
    gulp
      .watch(['app.js', 'server/index.js'], server.restart)
  })
