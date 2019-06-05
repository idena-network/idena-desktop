import {useState, useEffect} from 'react'

const {
  getDrafts: getDraftsFromStore,
  getPublishedFlips: getPublishedFromStore,
} = global.flipStore || {
  getDrafts: () => [],
  getPublishedFlips: () => [],
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

  return {flips, types, getDrafts}
}

export default useFlips
