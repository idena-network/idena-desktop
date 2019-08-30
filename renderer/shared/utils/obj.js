/* eslint-disable import/prefer-default-export */

function strip(obj) {
  // eslint-disable-next-line no-param-reassign
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key])
  return obj
}

const shallowCompare = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => obj1[key] === obj2[key])

export {strip, shallowCompare}
