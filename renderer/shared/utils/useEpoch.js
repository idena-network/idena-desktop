import {useState} from 'react'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {fetchEpoch} from '../api/dna'

function useEpoch() {
  const [epoch, setEpoch] = useState()

  useInterval(() => {
    let ignore = false

    async function fetchData() {
      const nextEpoch = await fetchEpoch()
      if (!ignore) {
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
