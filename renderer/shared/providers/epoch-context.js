import React from 'react'
import deepEqual from 'dequal'
import {useInterval} from '../hooks/use-interval'
import {fetchEpoch} from '../api'
import {
  didValidate,
  shouldExpectValidationResults,
  hasPersistedValidationResults,
} from '../../screens/validation/utils'
import {
  didArchiveFlips,
  markFlipsArchived,
  archiveFlips,
} from '../../screens/flips/utils'
import {persistItem} from '../utils/persist'
import {useAppMachine} from './app-context'

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
export function EpochProvider({children}) {
  const [epoch, setEpoch] = React.useState(null)
  const [interval, setInterval] = React.useState(1000 * 3)

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        const nextEpoch = await fetchEpoch()
        if (!ignore) {
          setEpoch(nextEpoch)
        }
      } catch (error) {
        setInterval(1000 * 5)
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

  useInterval(async () => {
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
  }, interval)

  React.useEffect(() => {
    if (epoch && didValidate(epoch.epoch) && !didArchiveFlips(epoch.epoch)) {
      archiveFlips()
      markFlipsArchived(epoch.epoch)
    }
  }, [epoch])

  React.useEffect(() => {
    if (
      epoch &&
      shouldExpectValidationResults(epoch.epoch) &&
      !hasPersistedValidationResults(epoch.epoch)
    ) {
      persistItem('validationResults', epoch.epoch, {
        epochStart: new Date().toISOString(),
      })
    }
  }, [epoch])

  return (
    <EpochStateContext.Provider value={epoch || null}>
      <EpochDispatchContext.Provider value={null}>
        {children}
      </EpochDispatchContext.Provider>
    </EpochStateContext.Provider>
  )
}

export function useEpochState() {
  const [{context}] = useAppMachine()
  return context.epoch
}

export function useEpochDispatch() {
  const context = React.useContext(EpochDispatchContext)
  if (context === undefined) {
    throw new Error('EpochDispatch must be used within a EpochProvider')
  }
  return context
}
