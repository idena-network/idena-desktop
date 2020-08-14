import {encode} from 'rlp'
import axios from 'axios'
import Jimp from 'jimp'
import {loadPersistentStateValue, persistItem} from '../../shared/utils/persist'
import {FlipType} from '../../shared/types'
import {areSame, areEual} from '../../shared/utils/arr'
import {submitFlip} from '../../shared/api'
import {signNonce} from '../../shared/utils/dna-link'

export const FLIP_LENGTH = 4
export const DEFAULT_FLIP_ORDER = [0, 1, 2, 3]

export function getRandomKeywordPair() {
  function getRandomInt(min, max) {
    // eslint-disable-next-line no-param-reassign
    min = Math.ceil(min)
    // eslint-disable-next-line no-param-reassign
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }

  return {id: 0, words: [getRandomInt(0, 3407), getRandomInt(0, 3407)]}
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

export function archiveFlips() {
  const {getFlips, saveFlips} = global.flipStore
  saveFlips(
    getFlips().map(flip =>
      flip.type === FlipType.Archived
        ? flip
        : {...flip, type: FlipType.Archived}
    )
  )
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

export function updateFlipType(flips, {id, type}) {
  return flips.map(flip =>
    flip.id === id
      ? {
          ...flip,
          type,
          ref: flip.ref,
        }
      : flip
  )
}

export async function publishFlip({
  keywordPairId,
  pics,
  compressedPics,
  images = compressedPics || pics,
  originalOrder,
  order,
  orderPermutations,
  hint,
}) {
  if (images.some(x => !x)) throw new Error('You must use 4 images for a flip')

  const flips = global.flipStore.getFlips()

  if (
    flips.some(
      flip =>
        flip.type === FlipType.Published &&
        flip.images &&
        areSame(flip.images, images)
    )
  )
    throw new Error('You already submitted this flip')

  if (areEual(order, hint ? DEFAULT_FLIP_ORDER : originalOrder))
    throw new Error('You must shuffle flip before submit')

  const compressedImages = await Promise.all(
    images.map(image =>
      Jimp.read(image).then(raw =>
        raw
          .resize(240, 180)
          .quality(60) // jpeg quality
          .getBase64Async('image/jpeg')
      )
    )
  )

  const [publicHex, privateHex] = flipToHex(
    hint ? images : originalOrder.map(num => compressedImages[num]),
    hint ? order : orderPermutations
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

export function formatKeywords(keywords) {
  return keywords
    .map(({name: [f, ...rest]}) => f.toUpperCase() + rest.join(''))
    .join(' / ')
}

export async function fetchKeywordTranslations(ids, locale) {
  return (
    await Promise.all(
      ids.map(async id =>
        (
          await fetch(
            `https://translation.idena.io/word/${id}/language/${locale}/translations`
          )
        ).json()
      )
    )
  ).map(({translations}) =>
    (translations || []).map(
      ({
        id,
        name,
        description: desc,
        confirmed,
        upVotes: ups,
        downVotes: downs,
      }) => ({
        id,
        name,
        desc,
        confirmed,
        ups,
        downs,
        score: ups - downs,
      })
    )
  )
}

export async function fetchConfirmedKeywordTranslations(ids, locale) {
  return (
    await Promise.all(
      ids.map(async id =>
        (
          await fetch(
            `https://translation.idena.io/word/${id}/language/${locale}/confirmed-translation`
          )
        ).json()
      )
    )
  ).map(({translation}) => translation)
}

export async function voteForKeywordTranslation({id, up}) {
  const timestamp = new Date().toISOString()
  const signature = await signNonce(id.concat(up).concat(timestamp))

  const {
    data: {resCode, upVotes, downVotes, error},
  } = await axios.post(`https://translation.idena.io/vote`, {
    signature,
    timestamp,
    translationId: id,
    up,
  })

  if (resCode > 0 && error) throw new Error(error)

  return {id, ups: upVotes - downVotes}
}

export async function suggestKeywordTranslation({
  wordId,
  name,
  desc,
  locale = global.locale,
}) {
  const timestamp = new Date().toISOString()

  const signature = await signNonce(
    wordId
      .toString()
      .concat(locale)
      .concat(name)
      .concat(desc)
      .concat(timestamp)
  )

  const {
    data: {resCode, translationId, error},
  } = await axios.post(`https://translation.idena.io/translation`, {
    word: wordId,
    name,
    description: desc,
    language: locale,
    signature,
    timestamp,
  })

  if (resCode > 0 && error) throw new Error(error)

  return {
    id: translationId,
    wordId,
    name,
    desc,
  }
}
