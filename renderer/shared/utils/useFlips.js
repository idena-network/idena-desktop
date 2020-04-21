import React, {useState, useEffect, useCallback} from 'react'
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
  Publishing: 'publishing',
  Published: 'published',
  Draft: 'draft',
  Archived: 'archived',
  Deleting: 'deleting',
}

const FLIP_MAX_SIZE = 1024 * 1024 // 1 mb
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

function toHex(pics, order) {
  const seed = perm(FLIP_LENGTH)
  const shuffled = shufflePics(pics, order, seed)

  const rlp = encode([
    shuffled.pics.map(src =>
      Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0))
    ),
    shuffled.orders,
  ])

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
  return [rlp, publicRlp, privateRlp].map(x => `0x${x.toString('hex')}`)
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
    async () => {
      const txPromises = flips
        .filter(
          f => f.type === FlipType.Publishing || f.type === FlipType.Deleting
        )
        .map(f => (f.type === FlipType.Publishing ? f.txHash : f.deleteTxHash))
        .map(fetchTx)
      await Promise.all(txPromises).then(txs => {
        const pendingFlips = flips.filter(
          f => f.type === FlipType.Publishing || f.type === FlipType.Deleting
        )
        const otherFlips = flips.filter(
          f => f.type !== FlipType.Publishing && f.type !== FlipType.Deleting
        )
        const nextFlips = pendingFlips
          .map(flip => {
            const tx = txs.find(
              ({hash}) =>
                hash &&
                ((flip.type === FlipType.Publishing && hash === flip.txHash) ||
                  hash === flip.deleteTxHash)
            )
            const type = checkFlipType(flip, tx)
            return {
              ...flip,
              mined: type === FlipType.Published,
              type,
            }
          })
          .concat(otherFlips)
        setFlips(nextFlips)
        saveFlips(nextFlips)
      })
    },
    flips.some(
      ({type}) => type === FlipType.Publishing || type === FlipType.Deleting
    )
      ? 1000 * 10
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
    async ({id, pics, compressedPics, order, hint}) => {
      if (
        flips.filter(
          f =>
            f.type === FlipType.Published &&
            f.compressedPics &&
            areSame(f.compressedPics, compressedPics)
        ).length > 0
      ) {
        return {
          error: {message: 'You already submitted this flip'},
        }
      }
      if (areEual(order, DEFAULT_ORDER)) {
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

      const [hex, publicHex, privateHex] = toHex(compressedPics, order)
      if (publicHex.length + privateHex.length > 2 * FLIP_MAX_SIZE) {
        return {
          error: {message: 'Flip is too large'},
        }
      }

      const resp = await api.submitFlip(
        hex,
        publicHex,
        privateHex,
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
              compressedPics,
              order,
              ...result,
              type: FlipType.Publishing,
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

  const deleteFlip = useCallback(
    async ({id}) => {
      const flip = getDraft(id)
      if (flip.type === FlipType.Published) {
        const resp = await api.deleteFlip(flip.hash)
        const {result} = resp
        if (result) {
          setFlips(prevFlips => {
            const flipIdx = prevFlips.findIndex(f => f.id === id)
            const nextFlips = [
              ...prevFlips.slice(0, flipIdx),
              {
                ...prevFlips[flipIdx],
                type: FlipType.Deleting,
                deleteTxHash: result,
                modifiedAt: Date.now(),
              },
              ...prevFlips.slice(flipIdx + 1),
            ]
            saveFlips(nextFlips)
            return nextFlips
          })
        }
        return resp
      }
      deleteFromStore(id)
      setFlips(prevFlips => prevFlips.filter(f => f.id !== id))
      return {}
    },
    [getDraft]
  )

  const archiveFlips = useCallback(() => {
    setFlips(prevFlips => {
      const nextFlips = prevFlips.map(flip => ({
        ...flip,
        type: FlipType.Archived,
      }))
      saveFlips(nextFlips)
      return nextFlips
    })
  }, [])

  const [, setLastFlips] = useLastFlips()

  useEffect(() => {
    setLastFlips(flips)
  }, [flips, setLastFlips])

  return {
    flips,
    getDraft,
    saveDraft,
    submitFlip,
    deleteFlip,
    archiveFlips,
  }
}

function checkFlipType(flip, tx) {
  if (flip.type === FlipType.Publishing) {
    const txExists = tx && tx.result
    if (!txExists) return FlipType.Draft
    return txExists && tx.result.blockHash !== HASH_IN_MEMPOOL
      ? FlipType.Published
      : flip.type
  }
  if (flip.type === FlipType.Deleting) {
    const txExists = tx && tx.result
    if (!txExists) return FlipType.Published
    return txExists && tx.result.blockHash !== HASH_IN_MEMPOOL
      ? FlipType.Draft
      : flip.type
  }
  return flip.type
}

const LastFlipsContext = React.createContext()

export function LastFlipsProvider(props) {
  const [state, setState] = React.useState([])
  return <LastFlipsContext.Provider value={[state, setState]} {...props} />
}

export function useLastFlips() {
  return React.useContext(LastFlipsContext)
}

export default useFlips
