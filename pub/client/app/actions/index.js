/**
 * Constants and helper functions for the actions
 */
import axios from 'axios'

const AXIOS = ('AXIOS' in global)
  ? global.AXIOS
  : process.env

const {
  API_PROTOCOL,
  API_HOST,
  API_PORT,
  API_BASEURL,
  API_VERSION
} = AXIOS

axios.defaults.baseURL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}/${API_BASEURL}/${API_VERSION}`

// Exposing `axios` to all the actions
export request from 'axios'
