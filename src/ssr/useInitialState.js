export function getInitialState(key) {
  if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
    if (window.__INITIAL_STATE__[key] !== undefined) {
      let value = window.__INITIAL_STATE__[key]
      delete window.__INITIAL_STATE__[key]
      return value
    }
  }
}
