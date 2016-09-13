/**
 * Sacred FS actions
 */
import { request } from '../../actions'

/**
 * Action Types
 */
export const GET_README = 'GET_README'

/**
 * Action Creators
 */
export function getReadMe () {
  return {
    type: GET_README,
    promise: () => request.get('read-me')
  }
}
