/* eslint promise/param-names: 0 */

const path = require('path')

const express = require('express')

const router = express.Router()

const processCwd = process.cwd()
const clientPath = path.join(processCwd, 'pub/client')
const serverPath = path.join(processCwd, 'pub/server')
const publicPath = path.join(processCwd, 'pub/public')

const generatePDF = require(path.resolve(processCwd, 'lib'))

/*
 *  For isomorphic rendering of stateless React components
 */
const {
  renderToStaticMarkup
} = require('react-stateless-renderer')

/*
 *  For isomorphic rendering of stateful React Redux components
 */
const {
  Renderer
} = require('redux-routes-renderer')
const renderer = new Renderer()

const {
  Routes
} = require(path.resolve(clientPath, 'app/routes'))

const {
  configureStore
} = require(path.resolve(clientPath, 'app/store'))

/*
 *  Stateless components (which are separate from the
 *  client app because we only use them with the 'generate-pdf'
 *  mechanism on the server)
 */
const {
  header,
  footer
} = require(path.resolve(serverPath, 'app/react/components'))

/*
 *  Configuration for the 'makeFace' method of the make-face' package
 */
const makeFace = {
  srcPath: path.join(serverPath, 'src/assets/font-face'),
  cssPath: path.join(publicPath, 'assets/css/font-face')
}

/*
 *  Configuration for the 'readFace' method of the 'make-face' package
 */
const readFace = {
  path: path.join(publicPath, 'assets/css/font-face')
}

router.get('/', (req, res) => {
  const store = configureStore()

  renderer.render(store, Routes, '/')
    .then(({ rendered, state }) => {
      res.render('index', { app: rendered, state })
    })
    .catch((e) => {
      res.send(e)
    })
})

router.get('/read-me', (req, res) => {
  const store = configureStore()

  generatePDF({
    /*
     *  Configuration for the 'node-html-pdf' package.
     *  We're not straying too far from the defaults, but
     *  the 'base' parameter is required if we want to load
     *  assets in Phantom which renders the HTML to a PDF.
     *  And we definitely want that
     */
    htmlPdf: {
      base: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    },
    /*
     *  The 'make-face' package is entirely optional, so if you don't want
     *  any of it to execute, omit the 'makeFace' and 'readFace'
     *  configuration objects.
     *
     *  Of course, you might want to use 'make-face' outside of the
     *  request (perhaps at application start, instead): in which case,
     *  omit the configuration here and remember that you can access
     *  anything in scope of the the 'render' functions when they
     *  execute
     */
    makeFace,
    readFace,
    /*
     *
     *  You can add more Promises to the chain as long as they eventually
     *  return the expected string/object values:
     *
     *    render: (parameters) => makeAnotherPromise().then(() => ({ layout: '<html />' })) // an object
     *
     *  Or:
     *
     *    layout: (parameters) => makeAnotherPromise().then(() => '<html />') // a string
     *
     *  Here, 'header' and 'footer' render stateless components
     */
    header: (parameters) => renderToStaticMarkup(header, parameters), // a string
    footer: (parameters) => renderToStaticMarkup(footer, parameters), // a string
    /*
     *  Here, 'layout' renders a stateful Redux component, then injects the App HTML into
     *  the Express view engine (which, in this case, is Pug) to generate the page
     */
    layout: (parameters) => (
      /*
       *  Redux Routes Renderer renders the React Redux components (of course)!
       */
      renderer.render(store, Routes, '/read-me')
        .then(({ rendered, state }) => (
          /*
           *  That's done!
           *
           *  Now to inject the rendered App HTML into the Express view engine
           *  to generate the page HTML. Since the view engine exposes a callback,
           *  it's necessary to wrap that in a Promise
           */
          new Promise((success, failure) => {
            res.render('index', { app: rendered, state }, (e, layout) => {
              /*
               *  That's done, too!
               *
               *  The view engine has rendered the page containing the App HTML.
               *  It's the page layout we want as a PDF so we'll return it -- at
               *  which point, 'generate-pdf' has everything it needs to generate
               *  a PDF!
               */
              if (!e) return success(layout) // a string
              failure(e)
            })
          })
        ))
    )
  })
  .then((pdf) => {
    res.attachment('README.pdf')
    res.send(pdf)
  })
  .catch((e) => {
    res.send(e)
  })
})

module.exports = router
