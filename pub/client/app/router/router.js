import React from 'react'

import {
  Router,
  browserHistory
} from 'react-router'

import {
  Routes
} from '../routes'

export default (
  <Router history={browserHistory}>
    {Routes}
  </Router>
)
