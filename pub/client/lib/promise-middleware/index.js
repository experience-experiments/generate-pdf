/**
 * Redux middleware to handle action creators with or
 * without Promises and fire additional `_REQUEST` and
 * `_FAILURE` actions. It keeps our action creators
 * simple and synchronous too. Amazing.
 */
export default function promiseMiddleware () {
  return (next) => (action) => {
    const { promise, type, ...rest } = action

    if (!promise) {
      return next(action)
    }

    const SUCCESS = type
    const REQUEST = type + '_REQUEST'
    const FAILURE = type + '_FAILURE'

    next({ ...rest, type: REQUEST })

    return promise()
      .then((r) => {
        next({ ...rest, r, type: SUCCESS })

        return true
      })
      .catch((e) => {
        next({ ...rest, e, type: FAILURE })

        return false
      })
  }
}
