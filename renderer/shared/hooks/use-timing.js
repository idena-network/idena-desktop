import React from 'react'
import {fetchCeremonyIntervals} from '../api'

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

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      const {
        ValidationInterval: validation,
        FlipLotteryDuration: flipLottery,
        ShortSessionDuration: shortSession,
        LongSessionDuration: longSession,
        AfterLongSessionDuration: afterLongSession,
      } = await fetchCeremonyIntervals()

      if (!ignore) {
        setTiming({
          validation,
          flipLottery,
          shortSession,
          longSession,
          afterLongSession,
          none:
            validation -
            (flipLottery + shortSession + longSession + afterLongSession),
        })
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  return timing
}

export default useTiming
