import {useState, useEffect, useCallback} from 'react'
import {encode} from 'rlp'
import {submitFlip} from '../api/dna'
import FlipType from '../../screens/flips/shared/types/flip-type'

// async function fetchData() {
//   const responses = await Promise.all(
//     getPublishedFlips().map(flip =>
//       fetchFlip(flip.hash).then(data => ({
//         ...flip,
//         data,
//       }))
//     )
//   )

//   const fetchedFlips = responses.map(({data: {result}, ...rest}) => ({
//     ...rest,
//     pics: result ? decode(fromHexString(result.hex.substr(2)))[0] : [],
//   }))

//   if (!ignore) {
//     setFlips({
//       ...flips,
//       flips: [
//         ...fetchedFlips,
//         ...new Array(requiredFlips).fill(null),
//       ].slice(requiredFlips),
//     })
//   }
// }

const {
  getDrafts: getDraftsFromStore,
  getDraft: getDraftFromStore,
  saveDrafts,
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
    // eslint-disable-next-line no-shadow
    const flips = getDraftsFromStore()
    setFlips(flips)
  }, [])

  useEffect(() => {
    if (flips.length > 0) {
      saveDrafts(flips)
    }
  }, [flips])

  const getDrafts = useCallback(
    () => flips.filter(f => f.type === FlipType.Draft),
    [flips]
  )

  const getDraft = useCallback(
    id => flips.find(f => f.id === id) || getDraftFromStore(id),
    [flips]
  )

  const saveDraft = useCallback(draft => {
    const nextDraft = {...draft, type: FlipType.Draft}
    setFlips(prevFlips => {
      const draftIdx = prevFlips.findIndex(f => f.id === draft.id)
      if (draftIdx > -1) {
        return [
          ...prevFlips.slice(0, draftIdx),
          {...nextDraft, modifiedAt: Date.now()},
          ...prevFlips.slice(draftIdx + 1),
        ]
      }
      return prevFlips.concat({...nextDraft, createdAt: Date.now()})
    })
  }, [])

  const publish = useCallback(async ({id, pics, order}) => {
    const encodedFlip = toHex(pics, order)
    const resp = await submitFlip(encodedFlip)
    setFlips(prevFlips => {
      const flipIdx = prevFlips.findIndex(f => f.id === id)
      return [
        ...prevFlips.slice(0, flipIdx),
        {
          ...prevFlips[flipIdx],
          type: FlipType.Published,
          modifiedAt: Date.now(),
        },
        ...prevFlips.slice(flipIdx + 1),
      ]
    })
    return resp
  }, [])

  const deleteFlip = useCallback(({id}) => {
    deleteFromStore(id)
    setFlips(prevFlips => prevFlips.filter(f => f.id !== id))
  }, [])

  return {
    flips,
    types: FlipType,
    getDrafts,
    getDraft,
    saveDraft,
    publish,
    deleteFlip,
  }
}

export default useFlips
