import React from 'react'
import deepEqual from 'dequal'
import {useInterval} from '../hooks/use-interval'
import {fetchEpoch} from '../api'

export const EpochPeriod = {
  FlipLottery: 'FlipLottery',
  ShortSession: 'ShortSession',
  LongSession: 'LongSession',
  AfterLongSession: 'AfterLongSession',
  None: 'None',
}

const EpochStateContext = React.createContext()

export function EpochProvider(props) {
  const [epoch, setEpoch] = React.useState(null)

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        const nextEpoch = await fetchEpoch()
        if (!ignore) {
          setEpoch(nextEpoch)
        }
      } catch (error) {
        global.logger.error(
          'An error occured while fetching epoch',
          error.message
        )
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  // useInterval(async () => {
  //   try {
  //     const nextEpoch = await fetchEpoch()
  //     if (!deepEqual(epoch, nextEpoch)) {
  //       setEpoch(nextEpoch)
  //     }
  //   } catch (error) {
  //     global.logger.error(
  //       'An error occured while fetching epoch',
  //       error.message
  //     )
  //   }
  // }, 1000 * 1)

  return <EpochStateContext.Provider value={epoch} {...props} />
}

export function useEpochState() {
  const context = React.useContext(EpochStateContext)
  if (context === undefined) {
    throw new Error('EpochState must be used within a EpochProvider')
  }
  return context
}
