import {failIf} from '../utils/fn'

const defaultType = 'story'
const knownTypes = [defaultType, 'beforeAfter']

const Guard = {
  type(type) {
    failIf(
      !knownTypes.includes(type),
      `Unknown type. Please use on of ${JSON.stringify(knownTypes)}`
    )
  },
  pics(pics) {
    failIf(pics.length === 0, 'You must provide at least 1 flip image')
  },
}

export const flipDefs = [
  {
    type: 'story',
    pics: [null, null, null, null],
    order: [[0, 0, 0, 0], [0, 0, 0, 0]],
  },
  {
    type: 'beforeAfter',
    pics: [null, null],
    order: [[0], [0]],
  },
]

/**
 * Action creator for the FLIP
 * @param {string} type
 * @param {Array} pics
 * @param {Array.<Array>} [order]
 */
export const createFlip = (type, pics, order) => {
  // Guard.pics(pics)
  Guard.type(type)

  return {type, pics, order}
}

export const createStoryFlip = (pics = [], order = [[], []]) =>
  createFlip(defaultType, pics, order)
