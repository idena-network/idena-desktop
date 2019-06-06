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

export function hasDataUrl(src) {
  return src && src.startsWith('data:')
}
