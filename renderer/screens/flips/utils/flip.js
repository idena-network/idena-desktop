import {encode} from 'rlp'
import dict from './words'
import {capitalize} from '../../../shared/utils/string'
import {
  loadPersistentStateValue,
  persistItem,
} from '../../../shared/utils/persist'
import {FlipType} from '../../../shared/types'
import {areSame, areEual} from '../../../shared/utils/arr'
import {submitFlip} from '../../../shared/api'

export const FLIP_LENGTH = 4
export const DEFAULT_FLIP_ORDER = [0, 1, 2, 3]

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

  const nextIdx =
    currId < 0
      ? 0
      : flipKeyWordPairs.indexOf(
          flipKeyWordPairs.find(({id}) => id === currId)
        ) + 1

  const nextKeyWordPair =
    nextIdx >= flipKeyWordPairs.length
      ? flipKeyWordPairs[0]
      : flipKeyWordPairs[nextIdx]

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

export function isPendingKeywordPair(flips, id) {
  return flips.find(
    ({type, keywordPairId}) =>
      type === FlipType.Publishing && keywordPairId === id
  )
}

export function didArchiveFlips(epoch) {
  const persistedState = loadPersistentStateValue('flipArchive', epoch)
  if (persistedState) return persistedState.archived
  return false
}

export function markFlipsArchived(epoch) {
  const persistedState = loadPersistentStateValue('flipArchive', epoch)
  if (persistedState && persistedState.archived) return
  persistItem('flipArchive', epoch, {
    archived: true,
    archivedAt: new Date().toISOString(),
  })
}

function perm(maxValue) {
  const permArray = new Array(maxValue)
  for (let i = 0; i < maxValue; i += 1) {
    permArray[i] = i
  }
  for (let i = maxValue - 1; i >= 0; i -= 1) {
    const randPos = Math.floor(i * Math.random())
    const tmpStore = permArray[i]
    permArray[i] = permArray[randPos]
    permArray[randPos] = tmpStore
  }
  return permArray
}

function shufflePics(pics, shuffledOrder, seed) {
  const newPics = []
  const cache = {}
  const firstOrder = new Array(FLIP_LENGTH)

  seed.forEach((value, idx) => {
    newPics.push(pics[value])
    if (value < FLIP_LENGTH) firstOrder[value] = idx
    cache[value] = newPics.length - 1
  })

  const secondOrder = shuffledOrder.map(value => cache[value])

  return {
    pics: newPics,
    orders:
      Math.random() < 0.5
        ? [firstOrder, secondOrder]
        : [secondOrder, firstOrder],
  }
}

export function flipToHex(pics, order) {
  const seed = perm(FLIP_LENGTH)
  const shuffled = shufflePics(pics, order, seed)

  const publicRlp = encode([
    shuffled.pics
      .slice(0, 2)
      .map(src =>
        Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0))
      ),
  ])

  const privateRlp = encode([
    shuffled.pics
      .slice(2)
      .map(src =>
        Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0))
      ),
    shuffled.orders,
  ])
  return [publicRlp, privateRlp].map(x => `0x${x.toString('hex')}`)
}

export async function publishFlip({
  keywordPairId,
  pics,
  images = pics,
  originalOrder,
  order,
  orderPermutations,
}) {
  const flips = global.flipStore.getFlips()

  if (
    flips.some(
      flip => flip.type === FlipType.Published && areSame(flip.images, images)
    )
  )
    throw new Error('You already submitted this flip')

  if (
    areEual(
      order,
      Array.from({length: 4}, (_, idx) => idx)
    )
  )
    throw new Error('You must shuffle flip before submit')

  const [publicHex, privateHex] = flipToHex(
    originalOrder.map(num => images[num]),
    orderPermutations
  )

  if (publicHex.length + privateHex.length > 2 * 1024 * 1024)
    throw new Error('Flip is too large')

  const {result, error} = await submitFlip(publicHex, privateHex, keywordPairId)

  if (error) {
    let {message} = error

    if (message.includes('candidate'))
      message = `It's not allowed to submit flips with your identity status`

    if (message.includes('ceremony'))
      message = `Can not submit flip during the validation session`

    throw new Error(message)
  }

  return result
}
