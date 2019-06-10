import {useState} from 'react'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {fetchEpoch} from '../api/dna'
import {shallowCompare} from './obj'

export const EpochPeriod = {
  FlipLottery: 'FlipLottery',
  ShortSession: 'ShortSession',
  LongSession: 'LongSession',
  AfterLongSession: 'AfterLongSession',
  None: 'None',
}

const initialEpoch = {
  epoch: null,
  nextValidation: null,
  currentPeriod: null,
}

function useEpoch() {
  const [epoch, setEpoch] = useState(initialEpoch)

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

  return epoch
}

export default useEpoch
