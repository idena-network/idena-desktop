/* eslint-disable import/prefer-default-export */

function strip(obj) {
  // eslint-disable-next-line no-param-reassign
  Object.keys(obj).forEach(key => !obj[key] && delete obj[key])
  return obj
}

export {strip}
