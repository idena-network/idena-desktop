import {capitalize} from '../../../../shared/utils/string'

/**
 * Composes hint for the flip
 * @param {object[]} words List of two words
 */
export function composeHint(words) {
  if (!words) {
    return ''
  }
  return words
    .map(w => (typeof w === 'string' ? w : w.name))
    .map(capitalize)
    .join(' / ')
}

/**
 * Decomposes flip hint into two words
 * @param {string} hint Flip hint
 */
export function decomposeHint(words) {
  return words.split('/')
}

export function hasDataUrl(src) {
  return src && src.startsWith('data:')
}
