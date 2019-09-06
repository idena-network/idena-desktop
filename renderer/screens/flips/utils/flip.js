import {alert} from 'react'
import dict from './words'
import {capitalize} from '../../../shared/utils/string'
import {useIdentityState} from '../../../shared/providers/identity-context'

/**
 * Composes hint for the flip
 * @param {object[]} words List of two words
 */
export function composeHint(hint) {
  if (!hint || !hint.words) {
    return ''
  }
  return hint.words
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

  const wordsPair = [firstWord, secondWord].map(({name, desc}) => ({
    name,
    desc: desc || name,
  }))

  return {idx: -1, words: wordsPair, id: -1}
}

export function getNextKeyWordsHint(flipKeyWordPairs, idx, i = 50) {
  if (flipKeyWordPairs) {
    const isLastId = idx + 1 > flipKeyWordPairs.length - 1
    const nextIdx = isLastId ? 0 : idx + 1

    if (flipKeyWordPairs[nextIdx] && flipKeyWordPairs[nextIdx].used) {
      if (i < 0) return getRandomHint()
      return getNextKeyWordsHint(flipKeyWordPairs, nextIdx, i - 1)
    }

    if (flipKeyWordPairs[nextIdx]) {
      const nextIndex1 = flipKeyWordPairs[nextIdx].words[0]
      const nextIndex2 = flipKeyWordPairs[nextIdx].words[1]
      const firstWord = dict[nextIndex1]
      const secondWord = dict[nextIndex2]

      const wordsPair = [firstWord, secondWord].map(({name, desc}) => ({
        name,
        desc: desc || name,
      }))

      return {idx: nextIdx, words: wordsPair, id: flipKeyWordPairs[nextIdx].id}
    }
    return getRandomHint()
  }
  return getRandomHint()
}
