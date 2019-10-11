import React, {useState, useEffect} from 'react'
import dayjs from 'dayjs'
import {useEpochState, EpochPeriod} from '../providers/epoch-context'
import {useTimingState} from '../providers/timing-context'
import {useInterval} from './use-interval'

const GAP = 9

export function useValidationTimer() {
  const {shortSession, longSession} = useTimingState()
  const epoch = useEpochState()

  const [seconds, setSeconds] = useState()
  const finish = React.useRef()
  const duration = React.useRef()

  function updateSeconds() {
    const secondsLeft = finish.current.diff(dayjs(), 's')
    setSeconds(
      secondsLeft < 0
        ? null
        : Math.max(Math.min(secondsLeft, duration.current), 0)
    )
  }

  useEffect(() => {
    if (epoch && shortSession && longSession) {
      const {currentPeriod, nextValidation} = epoch
      duration.current =
        shortSession +
        (currentPeriod === EpochPeriod.ShortSession ? 0 : longSession) -
        GAP
      finish.current = dayjs(nextValidation).add(duration.current, 's')
      updateSeconds()
    }
  }, [epoch, longSession, shortSession])

  useInterval(updateSeconds, seconds ? 1000 : null)

  return seconds
}

export default useValidationTimer
