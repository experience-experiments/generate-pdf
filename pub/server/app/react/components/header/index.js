import React from 'react'

/*
 *  If the PDF header and footer React components are only ever
 *  executed on the server within the 'generate-pdf' mechanism,
 *  then any and all Node modules are available to use. As here,
 *  which employs the 'fs' package to read a CSS file and
 *  populate the constant named 'headerCss'
 *//*
import fs from 'fs'
const headerCss = fs.readFileSync(__dirname + '/header.css')
*/

const getHeaderStyle = () => (`
  .header aside {
    font-family: 'Dobra-Light', sans serif;
    color: grey;
    margin: 0.5em;
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
const header = (props) => (
  <div>
    {/*
      * CSS from the 'readFace' mechanism
      */}
    <style type='text/css' dangerouslySetInnerHTML={{ __html: props.readFace['Dobra-Light'] }} />
    {/*
      * Declarations to apply the CSS from the 'readFace' mechanism
      */}
    <style type='text/css' dangerouslySetInnerHTML={{ __html: getHeaderStyle() }} />
    <div
      id='pageHeader'
      className='header'>
      <aside>
        generate-pdf
      </aside>
    </div>
  </div>
)

header.propTypes = {
  readFace: React.PropTypes.object.isRequired
}

export { header }
