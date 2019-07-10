import React from 'react'
import {fetchCeremonyIntervals} from '../api'
import {useInterval} from './use-interval'
import {logConnectivityIssue} from '../utils/log'

async function fetchTiming() {
  const {
    ValidationInterval: validation,
    FlipLotteryDuration: flipLottery,
    ShortSessionDuration: shortSession,
    LongSessionDuration: longSession,
    AfterLongSessionDuration: afterLongSession,
  } = await fetchCeremonyIntervals()

  return {
    validation,
    flipLottery,
    shortSession,
    longSession,
    afterLongSession,
  }
}

const initialTiming = {
  validation: null,
  flipLottery: null,
  shortSession: null,
  longSession: null,
  afterLongSession: null,
  none: null,
}

function useTiming() {
  const [timing, setTiming] = React.useState(initialTiming)
  const [interval, setInterval] = React.useState(null)

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      // eslint-disable-next-line no-shadow
      const timing = await fetchTiming()
      if (!ignore) {
        setTiming(timing)
      }
    }

    try {
      fetchData()
    } catch (error) {
      logConnectivityIssue('timing (initial)', error)
      setInterval(5000)
    }

    return () => {
      ignore = true
    }
  }, [])

  useInterval(async () => {
    try {
      // eslint-disable-next-line no-shadow
      const timing = await fetchTiming()
      setTiming(timing)
      setInterval(1000 * 60 * 5)
    } catch (error) {
      logConnectivityIssue('timing (poll)', error)
    }
  }, interval)

  return timing
}

export default useTiming
