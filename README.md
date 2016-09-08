# generatePDF()

The `generate-pdf` package exports a Promise interface for creating PDF documents from web pages. 

In its simplest form:

```
const configuration = {};

generatePDF(configuration)	
  .then((pdf) => console.log(pdf))
  .catch((e) => console.error(e))
```

Of course, you wouldn't want to output a PDF file to the console, but you would want to provide some configuration parameters.

To generate a PDF we make use of several other packages. We expose their configuration parameters on the configuration object: see the **Packages** section.


## React + Redux

While the `generate-pdf` package implements some interfaces to [Hogan.js](http://twitter.github.io/hogan.js/) templates, it's meant to be used with isomorphic React. But it isn't opinionated about *how* you implement isomorphic React, so no React or Redux packages are included as dependencies.

For stateful components implementing React Router, we use the `react-routes-renderer` and `redux-routes-renderer` packages. You should visit the repositories for [React.Routes.Render](https://github.com/sequencemedia/React.Routes.Renderer) and [Redux.Routes.Renderer](https://github.com/sequencemedia/Redux.Routes.Renderer) to evaluate them.

For stateless components, we use `react-stateless-renderer`. You should visit [its repository](https://github.com/sequencemedia/React.Stateless.Renderer), too.

Install each separately within your project, as you need them.

We suggest that you use stateless components for rendering the PDF header and footer HTML.

To implement your own rendering mechanism: the `ReactDOMServer` class (from the `react-dom/server` package) exposes the `renderToString()` and `renderToStaticMarkup()` methods. 

Using JSX they could be implemented as:

```
  ReactDOMServer.renderToString(
    <Component
      {...props}
    />
  )
  
  ReactDOMServer.renderToStaticMarkup(
    <Component
      {...props}
    />
  )
```

Without JSX:

```
  ReactDOMServer.renderToString(
    ReactDOMServer.createFactory(Component, props)
  )
  
  ReactDOMServer.renderToStaticMarkup(
    ReactDOMServer.createFactory(Component, props)
  )
```

In either case, the `props` object is just a literal. As you'll see in the **Rendering HTML** section, we pass the configuration object to each "thenable" step of the process as we generate a PDF so the `props` object could simply be that configuration object, or another object composed from its attributes.

## Packages

### make-face

While it's possible to use any of a number of font formats supported by Phantom JS within the main layout of the PDF (the fonts only have to be declared within the CSS used by the rendered HTML page), headers and footers render without fonts unless the font data is embedded in the header and footer HTML, too. 

Converting font files to CSS files with data embedded as `base64` is handled by the `make-face` package. You should visit [its repository](https://github.com/rma-consulting/make-face) for usage instructions. 

We use `makeFace` to convert font files to CSS then `readFace` to populate those files to an object (which is the return value of that function).

To configure the package, you should define a `makeFace` attribute on the parameters object for the method of the same name, and a `readFace` attribute for the method of that name, too.

```
{ 
  makeFace: { 
    srcPath: '/path/to/src', 
    cssPath: '/path/to/css' 
  }, 
  readFace: { 
    path: '/path/to/css' 
  } 
}
```

There is no return value from `makeFace`, but when `readFace` has executed it will replace the `readFace` attribute of the configuration object with its return value. 

Each key is the (truncated) file path of a CSS file and each value is the CSS file data, as a string. Assuming you have one CSS file is named 'FontName.css' then the configuration object will then look something like:

```
{ 
  makeFace: { 
    srcPath: '/path/to/src', 
    cssPath: '/path/to/css' 
  }, 
  readFace: { 
  	FontName: '@font-face { /* etc */ }'
  }
}
```

### hogan-cache

For rendering HTML layouts, headers and footers *without* React, we implement [Hogan.js](http://twitter.github.io/hogan.js/) handled by the `hogan-cache` package.

To configure the package, you should define a `hogan` attribute on the configuration object, with its attributes being key and value pairs describing a name and a file path for a Hogan template.

```
{
  hogan: { 
    header: '/path/to/header.mustache',
    footer: '/path/to/footer.mustache',
    navigation: '/path/to/partials/navigation.mustache'
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
Where `http://localhost:8080` is the location of the server from which any assets can be requested.

## Rendering HTML

Once the `makeFace`, `readFace` and `hogan` sections have executed, we proceed to the rendering steps. These are defined as methods on the configuration object.

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

To clarify, the return values of `layout`, `header` and `footer` should be strings populated with valid HTML. *At least* the layout method should return valid HTML. Otherwise, the `node-html-pdf` package will explode.

Inside these methods, you can do whatever you like to generate that HTML. Each method is passed the parameters object so that you have access to any `readFace` data or `hogan` templates. 

Similarly, you can render React components as described in the **React + Redux section**. Remember: it's Promises all the way down, so you can return another Promise as long as it eventually returns the appropriate object or string. 

For the PDF header and footer we recommend you implement stateless components.

For the PDF layout you might prefer to expose your rendering mechanism with a Promise.

## The PDF

The PDF is a Buffer instance. You can pass it into the `send` method of an Express response:

```
const configuration = {}

router.get('/pdf', (req, res) => { 

  generatePdf(configuration)
    .then((pdf) => { 
      res.attachment('name.pdf')
      res.send(pdf)
    })
    .catch((e) => {
      res.send(e)
    })

})
```
The `node-html-pdf` package does implement `toStream()` and `toFile()` methods, but we don't currently support them.