# generatePdf()

The `generate-pdf` package defines a Promise interface for creating PDF documents from web pages. In it's simplest form, it looks like:

```
const configuration = {};

generatePdf(configuration)
  .then((pdf) => console.log(pdf))
  .catch((err) => console.error(err))
```

Of course, you wouldn't want to output a PDF file to the console, and you will need to provide some configuration parameters, too.

To generate the PDF we make use of several other components. We expose their configuration parameters on the configuration object.

 
### make-face

While it's possible to use any of a number of font formats supported by Phantom JS within the main layout of the PDF (the fonts only have to be declared within the CSS used by the rendered HTML page), headers and footers render without fonts unless the font data is embedded in the header and footer HTML fragments, too. 

Converting font files to CSS files with data embedded as `base64` is handled by the `make-face` package. You should visit [its repository](https://github.com/rma-consulting/make-face) for usage instructions. 

We use `makeFace` to convert font files to CSS then `readFace` to populate those files to a JSON object (which is the return value of the function).

To configure the package, you should define a `makeFace` attribute on the parameters object for the method of the same name, and a `readFace` attribute for the method of that name, too.

```
{ 
  makeFace: 
  { 
    srcPath: '/path/to/src', 
    cssPath: '/path/to/css' 
  }, 
  readFace: { 
    path: '/path/to/css' 
  } 
}
```

There is no return value from `makeFace`, but when `readFace` has executed it will replace the parameters object with the file data it has read. Each key is the (truncated) file path of a CSS file and each value the CSS file data, as a string. Assuming you have one CSS file is named 'Font-Name.css' that object will look something like:

```
{ 
  "Font-Name": "@font-face { /* etc */ }"
}
```

### hogan-cache

For rendering HTML layouts, headers and footers *without* React, we implement [Hogan.js](http://twitter.github.io/hogan.js/) handled by the `hogan-cache` package.

To configure the package, you should define a `hogan` attribute on the parameters object, with its attributes simply key and value pairs describing a name and a file path for a Hogan template.

```
{
  hogan: { 
    header: '/path/to/header-template',
    footer: '/path/to/footer-template',
    headerPartial: '/path/to/header/partial-template',
    footerPartial: '/path/to/footer/partial-template'
  }
}
```

You can name the template anything you like, of course, and you can also define any templates you want to use as partials, too.

When the mechanism has executed it will replace the value of each attribute on the parameters object with the compiled template of that name.

### node-html-pdf

Generating the PDF is handled by the `node-html-pdf` package. You should visit [its repository](https://github.com/marcbachmann/node-html-pdf) to see all of the configuration options available. 

We don't enforce any of those options, but we do use our own `script` if none is populated.

**At the very least, you should populate the `base` option**. Think of it as the 'base href' for the Phantom JS browser instance. Images, stylesheets, scripts and other assets will not load without it.

To configure the package, you should define an `htmlPdf` attribute on the parameters object:

```
{ 
  htmlPdf: { 
    base: 'http://localhost:8080' 
  } 
}
```
## Rendering HTML

Once the `makeFace`, `readFace` and `hogan` sections have been executed, we execute the rendering steps. These are defined as methods on the configuration object.

### Either

```
{ 
  render: (parameters) => ({ layout: 'HTML', header: 'HTML', footer: 'HTML' })
}
```

To clarify, the return value of `render` should be an object having *at least* the layout attribute populated with valid HTML. Otherwise, the `node-html-pdf` package will explode. 

### Or 
```
{
  layout: (parameters) => 'HTML',
  header: (parameters) => 'HTML',
  footer: (parameters) => 'HTML
}
````

To clarify, the return values of `layout`, `header` and `footer` should be strings populated with valid HTML. *At least* the layout method should return valid HTML. Otherwise, the `node-html-pdf` package will explode. Honestly. It will.

Inside these methods, you can do whatever you like to generate that HTML. Each method is passed the parameters object so that you have access to any `readFace` data or `hogan` templates. Similarly, you can render React components with `ReactDOMServer.renderToString()`. Remember: it's Promises all the way down, so you can return another Promise as long as that eventually returns the appropriate object or string value.

## The PDF

It's a Buffer instance. You can drop it into the `send` method of an Express response:

```
const configuration = {}

router.get('/pdf', (req, res) => { 

  generatePdf(configuration)
    .then((pdf) => { 
      res.attachment('give me a name.pdf')
      res.send(pdf)
    })
    .catch((e) => {
      res.send(e)
    })

})
```
Easy.