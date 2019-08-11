import React from 'react'
import {fetchCeremonyIntervals} from '../api'
import {useInterval} from './use-interval'
import {logConnectivityIssue} from '../utils/log'

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

  useInterval(
    async () => {
      try {
        const {
          ValidationInterval: validation,
          FlipLotteryDuration: flipLottery,
          ShortSessionDuration: shortSession,
          LongSessionDuration: longSession,
          AfterLongSessionDuration: afterLongSession,
        } = await fetchCeremonyIntervals()

        setTiming({
          validation,
          flipLottery,
          shortSession,
          longSession,
          afterLongSession,
        })
        setInterval(1000 * 60 * 1)
      } catch (error) {
        logConnectivityIssue('timing', error)
      }
    },
    interval,
    true
  )

  return timing
}

export default useTiming
