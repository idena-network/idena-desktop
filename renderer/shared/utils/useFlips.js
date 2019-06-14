import {useState, useEffect, useCallback} from 'react'
import {encode} from 'rlp'
import * as api from '../api/dna'
import FlipType from '../../screens/flips/shared/types/flip-type'

const {
  getFlips: getFlipsFromStore,
  getFlip: getFlipFromStore,
  saveFlips,
  deleteDraft: deleteFromStore,
} = global.flipStore || {}

function shuffle(order) {
  const initialOrder = order.map((_, i) => i)
  return Math.random() < 0.5 ? [initialOrder, order] : [order, initialOrder]
}

function toHex(pics, order) {
  const buffs = pics.map(src =>
    Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0))
  )
  const hexBuffs = encode([buffs.map(ab => new Uint8Array(ab)), shuffle(order)])
  return `0x${hexBuffs.toString('hex')}`
}

function useFlips() {
  const [flips, setFlips] = useState([])

  useEffect(() => {
    const savedFlips = getFlipsFromStore()
    setFlips(savedFlips)
  }, [])

  useEffect(() => {
    if (flips.length > 0) {
      saveFlips(flips)
    }
  }, [flips])

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
      return draftIdx > -1
        ? [
            ...prevFlips.slice(0, draftIdx),
            {...prevFlips[draftIdx], ...nextDraft, modifiedAt: Date.now()},
            ...prevFlips.slice(draftIdx + 1),
          ]
        : prevFlips.concat({...nextDraft, createdAt: Date.now()})
    })
  }, [])

  const submitFlip = useCallback(async flip => {
    const {pics, order} = flip
    const resp = await api.submitFlip(toHex(pics, order))
    const {result} = resp
    if (result) {
      setFlips(prevFlips => {
        const flipIdx = prevFlips.findIndex(f => f.id === flip.id)
        return [
          ...prevFlips.slice(0, flipIdx),
          {
            ...flip,
            type: FlipType.Published,
            modifiedAt: Date.now(),
          },
          ...prevFlips.slice(flipIdx + 1),
        ]
      })
    }
    return resp
  }, [])

  const deleteFlip = useCallback(({id}) => {
    deleteFromStore(id)
    setFlips(prevFlips => prevFlips.filter(f => f.id !== id))
  }, [])

  return {
    flips,
    getDraft,
    saveDraft,
    submitFlip,
    deleteFlip,
  }
}

export default useFlips
