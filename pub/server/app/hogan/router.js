/* eslint promise/param-names: 0 */

const path = require('path')

const express = require('express')

const fs = require('fs')

const remark = require('remark')
const remarkHtml = require('remark-html')

const router = express.Router()

const processCwd = process.cwd()
const serverPath = path.join(processCwd, 'pub/server')
const publicPath = path.join(processCwd, 'pub/public')

const mdToHtmlParser = remark().use(remarkHtml)

const generatePDF = require(path.resolve(processCwd, 'lib'))

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

const hogan = {
  header: path.join(__dirname, 'views/partials/header.html'),
  footer: path.join(__dirname, 'views/partials/footer.html'),
  layout: path.join(__dirname, 'views/partials/layout.html')
}

const toHTML = (md) => (
  mdToHtmlParser.process(md).contents
)

const README = fs.readFileSync('README.md', 'utf8')
const readMe = toHTML(README)

router.get('/', (req, res) => { res.render('index') })

router.get('/read-me', (req, res) => {
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
    hogan,
    /*
     *  All Hogan templates
     */
    render: (parameters) => {
      const {
        hogan
      } = parameters
      const layout = hogan.layout.render({ readMe })
      const header = hogan.header.render(parameters)
      const footer = hogan.footer.render(parameters)
      return { layout, header, footer }
    }
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
