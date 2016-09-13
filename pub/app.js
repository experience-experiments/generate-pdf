/* eslint promise/param-names: 0 */

require('babel-register')

const fs = require('fs')
const path = require('path')

const processCwd = process.cwd()
const serverPath = path.resolve(processCwd, 'pub/server')

/*
http://stackoverflow.com/questions/9153571/is-there-a-way-to-get-version-from-package-json-in-nodejs-code
*/
const commander = require('commander')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const api = require(path.join(serverPath, 'api'))
const react = require(path.join(serverPath, 'app/react'))
const hogan = require(path.join(serverPath, 'app/hogan'))

/*
 *  These are very limited controls
 */
commander
  .version(pkg.version)
  .option('-r, --react <port>', 'The port on which to listen for the React UI')
  .option('-h, --hogan <port>', 'The port on which to listen for the Hogan UI')
  .parse(process.argv)

Promise.resolve()
  .then(() => {
    api.start()
  })
  .then(() => {
    /*
     *  We might want to start the React server
     */
    if (commander.react) react.start(commander.react)
    /*
     *  We might want to start the Hogan server
     */
    if (commander.hogan) hogan.start(commander.hogan)
  })
