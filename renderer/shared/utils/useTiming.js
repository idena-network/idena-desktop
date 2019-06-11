import {useState, useEffect} from 'react'
import {fetchCeremonyIntervals} from '../api'

function useTiming() {
  const [timing, setTiming] = useState({
    none: null,
    flipLottery: null,
    shortSession: null,
    longSession: null,
    afterLongSession: null,
    fullValidationSession: null,
  })

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const intervals = await fetchCeremonyIntervals()
      const {
        ValidationInterval: none,
        FlipLotteryDuration: flipLottery,
        ShortSessionDuration: shortSession,
        LongSessionDuration: longSession,
        AfterLongSessionDuration: afterLongSession,
      } = intervals

      const fullValidationSession =
        flipLottery + shortSession + longSession + afterLongSession

      if (!ignore) {
        setTiming({
          none,
          flipLottery,
          shortSession,
          longSession,
          afterLongSession,
          fullValidationSession,
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
