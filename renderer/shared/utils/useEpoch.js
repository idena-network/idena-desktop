import {useState} from 'react'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {fetchEpoch} from '../api/dna'

const shallowCompare = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => obj1[key] === obj2[key])

function useEpoch() {
  const [epoch, setEpoch] = useState({})

  useInterval(() => {
    let ignore = false

    async function fetchData() {
      const nextEpoch = await fetchEpoch()

      if (!ignore && !shallowCompare(nextEpoch, epoch)) {
        setEpoch(nextEpoch)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, 10000)

  return {
    epoch,
  }
}

export default useEpoch
