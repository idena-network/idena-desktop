import dict from './words'
import {capitalize} from '../../../shared/utils/string'

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

const randomIndex = currentIndex => Math.floor(Math.random() * currentIndex)

export function getRandomHint() {
  const nextIndex = randomIndex(dict.length)

  const firstWord = dict[nextIndex]
  const secondWord = dict[randomIndex(nextIndex)]

  // while (secondWord === firstWord) {
  //   secondWord = words[randomIndex(nextIndex)]
  // }

  return [firstWord, secondWord].map(({name, desc}) => ({
    name,
    desc: desc || name,
  }))
}
