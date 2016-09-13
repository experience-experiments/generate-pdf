import React from 'react'
import {
  Route,
  IndexRoute
} from 'react-router'

import IndexPage from './IndexPage'
import ReadMePage from './IndexPage/ReadMePage'

export default (
  <Route path='/'>
    <IndexRoute component={IndexPage} />
    <Route path='read-me' component={ReadMePage} />
  </Route>
)
