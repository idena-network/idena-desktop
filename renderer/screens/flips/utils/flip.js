import dict from './words'
import {capitalize} from '../../../shared/utils/string'

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

  return {id: -1, words: wordsPair}
}

export function getKeyWordsHint(flipKeyWordPairs, id) {
  if (!flipKeyWordPairs || !flipKeyWordPairs.length) return getRandomHint()

  const pairId = id && id >= 0 && id < flipKeyWordPairs.length ? id : 0

  const hint = flipKeyWordPairs[pairId]

  const nextIndex1 = hint.words[0]
  const nextIndex2 = hint.words[1]
  const firstWord = dict[nextIndex1] || {name: 'Error', descr: 'No word found'}
  const secondWord = dict[nextIndex2] || {name: 'Error', descr: 'No word found'}

  const wordsPair = [firstWord, secondWord].map(({name, desc}) => ({
    name,
    desc: desc || name,
  }))

  return {id, words: wordsPair}
}

export function getNextKeyWordsHint(
  flipKeyWordPairs,
  publishingFlips,
  currId = -1,
  i = 50
) {
  if (!flipKeyWordPairs || !flipKeyWordPairs.length) return getRandomHint()

  const nexIdx =
    currId < 0
      ? 0
      : flipKeyWordPairs.indexOf(
          flipKeyWordPairs.find(({id}) => id === currId)
        ) + 1

  const nextKeyWordPair =
    nexIdx >= flipKeyWordPairs.length
      ? flipKeyWordPairs[0]
      : flipKeyWordPairs[nexIdx]

  const isUsed =
    (nextKeyWordPair && nextKeyWordPair.used) ||
    (nextKeyWordPair &&
      publishingFlips.find(({hint}) => hint.id === nextKeyWordPair.id))

  if (isUsed) {
    // get next free pair

    if (i < 0) return getRandomHint() // no more free words

    return getNextKeyWordsHint(
      flipKeyWordPairs,
      publishingFlips,
      nextKeyWordPair.id,
      i - 1
    )
  }
  return getKeyWordsHint(flipKeyWordPairs, nextKeyWordPair.id)
}
