import {transformToMarginStyleObj} from './transform'
import {px} from './dims'

/* eslint-disable import/prefer-default-export */
export function margin(values) {
  let normalizedValues = []
  if (typeof values === 'string') {
    margin(values.split(' '))
    normalizedValues = new Array(4).fill(values, 0, 4)
  } else if (typeof values === 'number') {
    normalizedValues = new Array(4).fill(px(values), 0, 4)
  } else {
    switch (values.length) {
      default:
      case 4: {
        normalizedValues = [...values]
        break
      }
      case 1: {
        normalizedValues = new Array(4).fill(values[0], 0, 4)
        break
      }
      case 2: {
        normalizedValues = [...values, ...values]
        break
      }
      case 3: {
        normalizedValues = [values[1], values[1], values[2], values[0]]
        break
      }
    }
  }
  return transformToMarginStyleObj({
    mt: normalizedValues[0],
    mr: normalizedValues[1],
    mb: normalizedValues[2],
    ml: normalizedValues[3],
  })
}
