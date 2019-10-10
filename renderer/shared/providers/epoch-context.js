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
const EpochDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function EpochProvider({children}) {
  const [epoch, setEpoch] = React.useState(null)
  const [interval, setInterval] = React.useState(1000 * 1)

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        const nextEpoch = await fetchEpoch()
        if (!ignore) {
          setEpoch(nextEpoch)
        }
      } catch (error) {
        if (!ignore) {
          setInterval(1000 * 5)
        }
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

  useInterval(
    async () => {
      try {
        const nextEpoch = await fetchEpoch()
        if (!deepEqual(epoch, nextEpoch)) {
          setEpoch(nextEpoch)
        }
      } catch (error) {
        global.logger.error(
          'An error occured while fetching epoch',
          error.message
        )
      }
    },
    epoch ? interval : null
  )

  return (
    <EpochStateContext.Provider value={epoch}>
      <EpochDispatchContext.Provider value={null}>
        {children}
      </EpochDispatchContext.Provider>
    </EpochStateContext.Provider>
  )
}

function useEpochState() {
  const context = React.useContext(EpochStateContext)
  if (context === undefined) {
    throw new Error('EpochState must be used within a EpochProvider')
  }
  return context
}

function useEpochDispatch() {
  const context = React.useContext(EpochDispatchContext)
  if (context === undefined) {
    throw new Error('EpochDispatch must be used within a EpochProvider')
  }
  return context
}

export {EpochProvider, useEpochState, useEpochDispatch}
