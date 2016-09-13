import React from 'react'
import { connect } from 'react-redux'

import * as ReadMeActions from '../../../actions/read-me'

import remark from 'remark'
import remarkHtml from 'remark-html'

import HtmlToReact from 'html-to-react'

const mdToHtmlParser = remark().use(remarkHtml)

const htmlToReactParser = new HtmlToReact.Parser(React)

const toHTML = (md) => (
  mdToHtmlParser.process(md).contents
)

const toReact = (html) => ( // NOTE: 'class' NOT 'className'
  htmlToReactParser.parse((`
    <section class='md-to-html-to-react'>
      ${html}
    </section>
  `.trim())) // trimming because the parser barfs over leading whitespace
)

class ReadMePage extends React.Component {
  render () {
    const {
      readMe
    } = this.props

    return (
      toReact(toHTML(readMe.md))
    )
  }
}

ReadMePage.propTypes = {
  readMe: React.PropTypes.object.isRequired
}

ReadMePage.defaultProps = {
  readMe: {}
}

ReadMePage.needs = [
  ReadMeActions.getReadMe
]

export default connect(
  (state) => ({ readMe: state.readMe })
)(ReadMePage)
