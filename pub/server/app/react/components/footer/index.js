import React from 'react'

/*
 *  If the PDF header and footer React components are only ever
 *  executed on the server within the 'generate-pdf' mechanism,
 *  then any and all Node modules are available to use. As here,
 *  which employs the 'fs' package to read a CSS file and
 *  populate the constant named 'footerCss'
 *//*
import fs from 'fs'
const footerCss = fs.readFileSync(__dirname + '/footer.css')
*/

/*
 *  The string returned from this method is exactly the same as
 *  the contents of the file read from 'footer.css' on the file
 *  system. You can use whatever approach you prefer
 */
const getFooterCss = () => (`
  .footer aside {
    font-family: 'Dobra-Medium', sans serif;
    color: silver;
    margin: .5em;
  }
`)

/*
 *  Refer to
 *
 *    https://github.com/marcbachmann/node-html-pdf/
 *
 *  for the complete configuration options of the generated
 *  PDF header and footer HTML
 */
const footer = (props) => (
  <div>
    {/*
      * CSS from the 'readFace' mechanism
      */}
    <style type='text/css' dangerouslySetInnerHTML={{ __html: props.readFace['Dobra-Medium'] }} />
    {/*
      * Declarations to apply the CSS from the 'readFace' mechanism
      */}
    <style type='text/css' dangerouslySetInnerHTML={{ __html: getFooterCss() }} />
    <div
      id='pageFooter-first'
      className='footer'>
      <aside>
        First Page
      </aside>
    </div>
    <div
      id='pageFooter-last'
      className='footer'>
      <aside>
        Last Page
      </aside>
    </div>
    <div
      id='pageFooter'
      className='footer'>
      <aside>
        Page {'{{page}}'} of {'{{pages}}'}
      </aside>
    </div>
  </div>
)

footer.propTypes = {
  readFace: React.PropTypes.object.isRequired
}

export { footer }
