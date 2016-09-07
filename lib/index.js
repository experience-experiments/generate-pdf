/* eslint promise/param-names: 0 */

const makeFace = require('make-face')
const getHoganFor = require('hogan-cache').getHoganFor
const htmlPdf = require('html-pdf')

const executeMakeFace = (parameters) => (
  ('makeFace' in parameters)
    ? makeFace(parameters.makeFace.srcPath, parameters.makeFace.cssPath)
      .then(() => parameters)
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

module.exports = (parameters) => (
  Promise.resolve(parameters)
    .then(executeMakeFace)
    .then(executeHoganFor)
    .then(render)
    .then(({ layout, header, footer, pdf }) => (
      new Promise((success, failure) => {
        const options = { ...pdf }
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
        htmlPdf
          .create(layout, options)
          .toBuffer((e, buffer) => {
            if (!e) return success(buffer)
            failure(e)
          })
      })
    ))
)
