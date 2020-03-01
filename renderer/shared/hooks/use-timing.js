import React from 'react'
import {fetchCeremonyIntervals} from '../api'
import {useInterval} from './use-interval'

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
  const [interval, setInterval] = React.useState(1000 * 60)

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
        setInterval(1000 * 5 * 1)
        global.logger.error(
          'An error occured while fetching ceremony intervals',
          error.message
        )
      }
    },
    interval,
    true
  )

  return timing
}

export default useTiming
