import {useState, useContext} from 'react'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {
  NotificationContext,
  NotificationType,
} from '../providers/notification-provider'
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

  const {addNotification} = useContext(NotificationContext)

  useInterval(
    () => {
      let ignore = false

      async function fetchData() {
        try {
          const nextEpoch = await fetchEpoch()
          if (!ignore && !shallowCompare(nextEpoch, epoch)) {
            setEpoch(nextEpoch)
          }
        } catch (error) {
          addNotification({
            title: 'Error connecting to node',
            body: error.message,
            type: NotificationType.Error,
          })
        }
      }

      fetchData()

      return () => {
        ignore = true
      }
    },
    10000,
    true
  )

  return epoch
}

export default useEpoch
