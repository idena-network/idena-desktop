import {useState, useEffect} from 'react'
import dayjs from 'dayjs'
import {useEpochState, EpochPeriod} from '../providers/epoch-context'
import {useTimingState} from '../providers/timing-context'
import {useInterval} from './use-interval'

const GAP = 10

export function useValidationTimer() {
  const [seconds, setSeconds] = useState()

  const {shortSession, longSession} = useTimingState()
  const epoch = useEpochState()

  useEffect(() => {
    if (epoch && shortSession && longSession) {
      const {currentPeriod, currentValidationStart, nextValidation} = epoch

      const start = dayjs(currentValidationStart || nextValidation)

      const duration =
        currentPeriod === EpochPeriod.ShortSession
          ? shortSession
          : shortSession + longSession

      const finish = start.add(duration, 's').subtract(GAP, 's')

      const diff = Math.min(finish.diff(dayjs(), 's'), duration)

      setSeconds(Math.max(diff, 0))
    }
  }, [epoch, shortSession, longSession, seconds])

  useInterval(() => setSeconds(seconds - 1), seconds > 0 ? 1000 : null)

  return seconds
}

export default useValidationTimer
