import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { Routes } from '../app/routes'
import { configureStore } from '../app/store'

const app = document.getElementById('app')
const state = JSON.parse(app.getAttribute('data-state'))
const store = configureStore(state)

const App = (
 <Provider store={store}>
    <Router history={browserHistory}>
      {Routes}
    </Router>
  </Provider>
)

ReactDOM.render(
  App,
  app
)
