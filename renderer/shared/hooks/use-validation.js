import {useState, useEffect} from 'react'
import dayjs from 'dayjs'
import {useEpochState, EpochPeriod} from '../providers/epoch-context'
import {useTimingState} from '../providers/timing-context'
import {useInterval} from './use-interval'

const GAP = 10

export function useValidationTimer() {
  const {shortSession, longSession} = useTimingState()
  const epoch = useEpochState()

  const [seconds, setSeconds] = useState()

  useEffect(() => {
    if (epoch && shortSession && longSession) {
      const {currentPeriod, currentValidationStart, nextValidation} = epoch

      const start = dayjs(currentValidationStart || nextValidation)
      const duration =
        shortSession +
        (currentPeriod === EpochPeriod.ShortSession ? 0 : longSession) -
        GAP
      const finish = start.add(duration, 's')
      const diff = Math.max(Math.min(finish.diff(dayjs(), 's'), duration), 0)

      setSeconds(diff)
    }
  }, [epoch, longSession, shortSession])

  useInterval(() => setSeconds(seconds - 1), seconds ? 1000 : null)

  return seconds
}

export default useValidationTimer
