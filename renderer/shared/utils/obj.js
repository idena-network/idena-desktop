/* eslint-disable import/prefer-default-export */

function strip(obj) {
  // eslint-disable-next-line no-param-reassign
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key])
  return obj
}

const shallowCompare = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => obj1[key] === obj2[key])

export function removeKeys(obj, keys) {
  if (!obj) return obj
  return Object.keys(obj).reduce((prev, key) => {
    switch (typeof obj[key]) {
      case 'object': {
        if (Array.isArray(obj[key])) {
          prev[key] = obj[key].map(item => removeKeys(item, keys))
        } else {
          const index = keys.indexOf(key)
          if (index === -1) {
            prev[key] = removeKeys(obj[key], keys)
          }
        }
        break
      }
      default: {
        const index = keys.indexOf(key)
        if (index === -1) {
          prev[key] = obj[key]
          return prev
        }
        break
      }
    }
    return prev
  }, {})
}

export {strip, shallowCompare}
