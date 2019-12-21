import {useState, useEffect, useCallback} from 'react'
import {encode} from 'rlp'
import * as api from '../api/dna'
import {useInterval} from '../hooks/use-interval'
import {fetchTx} from '../api'
import {HASH_IN_MEMPOOL} from './tx'
import {areSame, areEual} from './arr'

const {
  getFlips: getFlipsFromStore,
  getFlip: getFlipFromStore,
  saveFlips,
  deleteDraft: deleteFromStore,
} = global.flipStore || {}

export const FlipType = {
  Published: 'published',
  Draft: 'draft',
  Archived: 'archived',
}

const DEFAULT_ORDER = [0, 1, 2, 3]

const FLIP_LENGTH = DEFAULT_ORDER.length

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

function toHex(pics, order, nonSensePic, nonSenseOrder) {
  const seed = nonSenseOrder >= 0 ? perm(FLIP_LENGTH + 1) : perm(FLIP_LENGTH)

  const k = order.findIndex(idx => idx === nonSenseOrder)
  const nextPics = k >= 0 ? [...pics, nonSensePic] : pics
  const nextOrder =
    k >= 0 ? [...order.slice(0, k), FLIP_LENGTH, ...order.slice(k + 1)] : order

  const shuffled = shufflePics(nextPics, nextOrder, seed)

  const rlp = encode([
    shuffled.pics.map(src =>
      Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0))
    ),
    shuffled.orders,
  ])
  return `0x${rlp.toString('hex')}`
}

function useFlips() {
  const [flips, setFlips] = useState([])

  useEffect(() => {
    const savedFlips = getFlipsFromStore()
    if (savedFlips.length) {
      setFlips(savedFlips)
    }
  }, [])

  useInterval(
    () => {
      const txPromises = flips
        .filter(f => f.type === FlipType.Published)
        .map(f => f.txHash)
        .map(fetchTx)
      Promise.all(txPromises).then(txs => {
        const nextFlips = flips.map(flip => {
          const tx = txs.find(({hash}) => hash === flip.txHash)
          return {
            ...flip,
            mined: tx && tx.result && tx.result.blockHash !== HASH_IN_MEMPOOL,
          }
        })
        setFlips(nextFlips)
        saveFlips(nextFlips)
      })
    },
    flips.filter(({type, mined}) => type === FlipType.Published && !mined)
      .length
      ? 10000
      : null
  )

  const getDraft = useCallback(
    id => flips.find(f => f.id === id) || getFlipFromStore(id),
    [flips]
  )

  const saveDraft = useCallback(draft => {
    setFlips(prevFlips => {
      const draftIdx = prevFlips.findIndex(
        f => f.id === draft.id && f.type === FlipType.Draft
      )
      const nextDraft = {...draft, type: FlipType.Draft}
      const nextFlips =
        draftIdx > -1
          ? [
              ...prevFlips.slice(0, draftIdx),
              {...prevFlips[draftIdx], ...nextDraft, modifiedAt: Date.now()},
              ...prevFlips.slice(draftIdx + 1),
            ]
          : prevFlips.concat({...nextDraft, createdAt: Date.now()})

      saveFlips(nextFlips)

      return nextFlips
    })
  }, [])

  const submitFlip = useCallback(
    async ({id, pics, order, nonSensePic, nonSenseOrder, hint}) => {
      if (
        flips.filter(
          f => f.type === FlipType.Published && areSame(f.pics, pics)
        ).length > 0
      ) {
        return {
          error: {message: 'You already submitted this flip'},
        }
      }
      if (areEual(order, DEFAULT_ORDER) && nonSenseOrder < 0) {
        return {
          error: {message: 'You must shuffle flip before submit'},
        }
      }
      if (!hint) {
        return {
          error: {message: 'Keywords for flip are not specified'},
        }
      }

      const pairId = hint.id

      if (pairId < 0) {
        return {
          error: {message: 'Keywords for flip are not allowed'},
        }
      }

      const resp = await api.submitFlip(
        toHex(pics, order, nonSensePic, nonSenseOrder),
        Math.max(0, pairId)
      )
      const {result} = resp
      if (result) {
        setFlips(prevFlips => {
          const flipIdx = prevFlips.findIndex(f => f.id === id)
          const nextFlips = [
            ...prevFlips.slice(0, flipIdx),
            {
              ...prevFlips[flipIdx],
              id,
              pics,
              order,
              ...result,
              type: FlipType.Published,
              modifiedAt: Date.now(),
            },
            ...prevFlips.slice(flipIdx + 1),
          ]

          saveFlips(nextFlips)

          return nextFlips
        })
      }
      return resp
    },
    [flips]
  )

  const deleteFlip = useCallback(({id}) => {
    deleteFromStore(id)
    setFlips(prevFlips => prevFlips.filter(f => f.id !== id))
  }, [])

  const archiveFlips = useCallback(() => {
    const nextFlips = flips.map(f => ({
      ...f,
      type: FlipType.Archived,
    }))
    setFlips(nextFlips)
    saveFlips(nextFlips)
  }, [flips])

  return {
    flips,
    getDraft,
    saveDraft,
    submitFlip,
    deleteFlip,
    archiveFlips,
  }
}

export default useFlips
