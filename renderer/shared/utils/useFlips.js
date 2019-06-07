import {useState, useEffect} from 'react'
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

  const [types, setTypes] = useState(initialTypes)

  useEffect(() => {
    const uniqTypes = flips
      .map(f => f.type)
      .filter(t => t)
      .filter((v, i, a) => a.indexOf(v) === i)

    const typesObj = uniqTypes.reduce((acc, curr) => {
      acc[curr] = curr
      return acc
    }, {})

    setTypes({...types, ...typesObj})
  }, [flips, types])

  useEffect(() => {
    if (flips && flips.length > 0) {
      saveDrafts(flips)
    }
  }, [flips])

  const getDrafts = () => {
    return flips.filter(f => f.type === types.drafts)
  }

  function getDraft(id) {
    return flips.find(f => f.id === id) || getDraftFromStore(id)
  }

  function saveDraft(draft) {
    const draftIdx = flips.findIndex(f => f.id === draft.id)
    const nextDraft = {...draft, type: types.drafts}
    if (draftIdx > -1) {
      setFlips([
        ...flips.slice(0, draftIdx),
        {...nextDraft, modifiedAt: Date.now()},
        ...flips.slice(draftIdx + 1),
      ])
    } else {
      setFlips(flips.concat({...draft, createdAt: Date.now()}))
    }
  }

  async function publish({id, pics, order}) {
    const encodedFlip = toHex(pics, order)
    const resp = await submitFlip(encodedFlip)

    const flipIdx = flips.findIndex(f => f.id === id)
    setFlips([
      ...flips.slice(0, flipIdx),
      {...flips[flipIdx], type: types.published, modifiedAt: Date.now()},
      ...flips.slice(flipIdx + 1),
    ])

    return resp
  }

  return {
    flips,
    types,
    getDrafts,
    getDraft,
    saveDraft,
    publish,
  }
}

export default useFlips
