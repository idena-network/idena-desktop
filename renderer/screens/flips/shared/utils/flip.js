import {encode} from 'rlp'
import {toHex} from '../../../../shared/utils/req'
import {randomFlipOrder} from '../../screens/create-flip/utils/order'

/**
 * Composes hint for the flip
 * @param {string[]} words List of two words
 */
export function composeHint(words) {
  return words.join('/')
}

/**
 * Decomposes flip hint into two words
 * @param {string} hint Flip hint
 */
export function decomposeHint(words) {
  return words.split('/')
}

/**
 * Encodes flips pics into hex with `rlp`
 * @param {string[]} pics List of flip pics to encode into hex
 * @param {number[]} order Shuffled flip pics indices
 */
export function flipToHex(pics, order) {
  const arrayBuffers = pics.map(src => {
    const byteString = src.split(',')[1]
    return Uint8Array.from(atob(byteString), c => c.charCodeAt(0))
  })

  const hexBuff = encode([
    arrayBuffers.map(ab => new Uint8Array(ab)),
    randomFlipOrder(pics, order),
  ])

  return toHex(hexBuff)
}

export function hasDataUrl(src) {
  return src && src.startsWith('data:')
}
