import React from 'react'
import dayjs from 'dayjs'
import deepEqual from 'dequal'
import {useInterval} from '../hooks/use-interval'
import {fetchEpoch} from '../api'
import {useTimingState} from './timing-context'
import {logConnectivityIssue} from '../utils/log'

const hasValues = obj => Object.values(obj).every(x => x)
const GAP = 60

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
  const [interval, setInterval] = React.useState(null)

  const timing = useTimingState()

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        // eslint-disable-next-line no-shadow
        const epoch = await fetchEpoch()
        if (!ignore) {
          setEpoch(epoch)
        }
      } catch (error) {
        logConnectivityIssue('epoch (initial)', error)
        setInterval(5000)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  React.useEffect(() => {
    if (epoch && hasValues(timing)) {
      const {currentValidationStart, nextValidation} = epoch
      const validationStart = dayjs(currentValidationStart || nextValidation)

      const secondsBeforeValidation = dayjs(validationStart).diff(dayjs(), 's')
      const secondsAfterValidationStart = dayjs().diff(
        dayjs(validationStart),
        's'
      )

      const {flipLottery, shortSession, longSession, afterLongSession} = timing

      const isValidationSoon =
        secondsBeforeValidation > 0 &&
        secondsBeforeValidation < flipLottery + GAP

      const isValidationRunning =
        secondsAfterValidationStart >= 0 &&
        secondsAfterValidationStart <
          shortSession + longSession + afterLongSession + GAP

      setInterval(
        isValidationSoon || isValidationRunning
          ? 1000
          : validationStart.subtract(GAP, 's').diff(dayjs(), 'ms')
      )
    }
  }, [epoch, timing])

  useInterval(async () => {
    try {
      const nextEpoch = await fetchEpoch()
      if (!deepEqual(epoch, nextEpoch)) {
        setEpoch(nextEpoch)
      }
    } catch (error) {
      logConnectivityIssue('epoch (poll)', error)
    }
  }, interval)

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
