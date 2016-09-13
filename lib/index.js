/* eslint promise/param-names: 0 */

/*
 *  TODO:
 *  nconf is probably overkill. All we want is a configurable JSON object
 */
const nconf = require('nconf')

const path = require('path')

const {
  makeFace,
  readFace
} = require('make-face')

const {
  getHoganFor
} = require('hogan-cache')

const htmlPdf = require('html-pdf')

const file = path.resolve(__dirname, 'config.json')

nconf
  .env()
  .argv()
  .file({ file })

let script = nconf.get('htmlPdf:script')
script = path.resolve(__dirname, script)
nconf.set('htmlPdf:script', script)

const executeMakeFace = (parameters) => (
  ('makeFace' in parameters)
    ? makeFace(parameters.makeFace.srcPath, parameters.makeFace.cssPath)
      .then(() => parameters)
   : parameters
)

const executeReadFace = (parameters) => (
  ('readFace' in parameters)
    ? readFace(parameters.readFace.path)
      .then((readFace) => ({ ...parameters, readFace }))
    : parameters
)

const executeHoganFor = (parameters) => (
  ('hogan' in parameters)
    ? getHoganFor(parameters.hogan)
      .then((hogan) => ({ ...parameters, hogan }))
    : parameters
)

const createHeaderHtml = (parameters) => (
  ('header' in parameters)
    ? Promise.resolve()
      .then(() => parameters.header(parameters))
      .then((header) => ({ ...parameters, header }))
    : parameters
)

const createFooterHtml = (parameters) => (
  ('footer' in parameters)
    ? Promise.resolve()
      .then(() => parameters.footer(parameters))
      .then((footer) => ({ ...parameters, footer }))
    : parameters
)

const createLayoutHtml = (parameters) => (
  ('layout' in parameters)
    ? Promise.resolve()
      .then(() => parameters.layout(parameters))
      .then((layout) => ({ ...parameters, layout }))
    : parameters
)

const render = (parameters) => (
  ('render' in parameters)
    ? Promise.resolve()
      .then(() => parameters.render(parameters))
      .then(({ layout, header, footer }) => ({ ...parameters, layout, header, footer }))
    : Promise.resolve(parameters)
      .then(createHeaderHtml)
      .then(createFooterHtml)
      .then(createLayoutHtml)
)

const preparePDFOptions = ({ layout, header, footer, htmlPdf }) => {
  const options = { ...htmlPdf } //

  options.script = (
  options.script || script)

  if ('header' in options) {
    options.header.contents = header
  } else {
    options.header = {
      contents: header
    }
  }

  if ('footer' in options) {
    options.footer.contents = footer
  } else {
    options.footer = {
      contents: footer
    }
  }

  return { layout, options }
}

const createPDFAsBuffer = ({ layout, options }) => (
  new Promise((success, failure) => {
    htmlPdf
      .create(layout, options)
      .toBuffer((e, buffer) => {
        if (!e) return success(buffer)
        failure(e)
      })
  })
)

module.exports = (parameters) => (
  Promise.resolve(parameters)
    .then(executeMakeFace)
    .then(executeReadFace)
    .then(executeHoganFor)
    .then(render)
    .then(preparePDFOptions)
    .then(createPDFAsBuffer)
)
