import {useState, useEffect, useCallback} from 'react'
import {encode} from 'rlp'
import {submitFlip} from '../api/dna'

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

const {getDrafts: getDraftsFromStore, getDraft: getDraftFromStore, saveDrafts} =
  global.flipStore || {}

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

const initialTypes = {
  published: 'published',
  drafts: 'drafts',
  archived: 'archived',
}

function useFlips() {
  const [flips, setFlips] = useState([])

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const flips = getDraftsFromStore()
    setFlips(flips)
  }, [])

  const getDrafts = useCallback(
    () => flips.filter(f => f.type === initialTypes.drafts),
    [flips]
  )

  const getDraft = useCallback(
    id => flips.find(f => f.id === id) || getDraftFromStore(id),
    [flips]
  )

  const saveDraft = useCallback(
    draft => {
      const draftIdx = flips.findIndex(f => f.id === draft.id)
      const nextDraft = {...draft, type: initialTypes.drafts}
      let nextFlips = []
      if (draftIdx > -1) {
        nextFlips = [
          ...flips.slice(0, draftIdx),
          {...nextDraft, modifiedAt: Date.now()},
          ...flips.slice(draftIdx + 1),
        ]
      } else {
        nextFlips = flips.concat({...nextDraft, createdAt: Date.now()})
      }
      saveDrafts(nextFlips)
      setFlips(nextFlips)
    },
    [flips]
  )

  const publish = useCallback(
    async ({id, pics, order}) => {
      const encodedFlip = toHex(pics, order)
      const resp = await submitFlip(encodedFlip)

      const flipIdx = flips.findIndex(f => f.id === id)
      setFlips([
        ...flips.slice(0, flipIdx),
        {
          ...flips[flipIdx],
          type: initialTypes.published,
          modifiedAt: Date.now(),
        },
        ...flips.slice(flipIdx + 1),
      ])

      return resp
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return {
    flips,
    types: initialTypes,
    getDrafts,
    getDraft,
    saveDraft,
    publish,
  }
}

export default useFlips
