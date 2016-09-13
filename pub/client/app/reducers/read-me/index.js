import { GET_README } from '../../actions/read-me'

/**
 * Practice Reducer
 *
 * @param {Object} state Initial state
 * @param {Object} action
 */
export default function readMeReducer (state = {}, action) {
  switch (action.type) {
    case GET_README:
      return { ...action.r.data }
    default:
      return state
  }
}
