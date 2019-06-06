import {useState, useEffect} from 'react'
import {encode} from 'rlp'
import {submitFlip} from '../api/dna'

const {
  getDrafts: getDraftsFromStore,
  getPublishedFlips: getPublishedFromStore,
} = global.flipStore || {
  getDrafts: () => [],
  getPublishedFlips: () => [],
}

function shuffleOrder(pics, randomOrder) {
  const directOrder = pics.map((_, i) => i)
  return Math.random() < 0.5
    ? [directOrder, randomOrder]
    : [randomOrder, directOrder]
}

/**
 * Encodes flips pics into hex with `rlp`
 * @param {string[]} pics List of flip pics to encode into hex
 * @param {number[]} order Shuffled flip pics indices
 */
function toHex(pics, order) {
  const buffs = pics.map(src =>
    Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0))
  )

  const hexBuffs = encode([
    buffs.map(ab => new Uint8Array(ab)),
    shuffleOrder(pics, order),
  ])

  return `0x${hexBuffs.toString('hex')}`
}

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

  const getDrafts = () => {
    return flips
  }

  async function publish({pics, order}) {
    const encodedFlip = toHex(pics, order)
    const resp = await submitFlip(encodedFlip)
    return resp
  }

  return {flips, types, getDrafts, publish}
}

export default useFlips
