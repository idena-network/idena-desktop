import {useState, useEffect} from 'react'
import {fetchCeremonyIntervals} from '../api'

function useValidationTiming() {
  const [validationTiming, setValidationTiming] = useState()

  useEffect(() => {
    let ignore = false

    const {
      ValidationInterval: validation,
      FlipLotteryDuration: flipLottery,
      ShortSessionDuration: shortSession,
      LongSessionDuration: longSession,
      AfterLongSessionDuration: afterLongSession,
    } = fetchCeremonyIntervals()

    if (!ignore) {
      setValidationTiming({
        validation,
        flipLottery,
        shortSession,
        longSession,
        afterLongSession,
      })
    }

    return () => {
      ignore = true
    }
  }, [])

  return validationTiming
}

export default useValidationTiming
