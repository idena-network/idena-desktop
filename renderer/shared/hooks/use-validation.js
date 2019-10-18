import React, {useEffect} from 'react'
import dayjs from 'dayjs'
import {useEpochState} from '../providers/epoch-context'
import {useTimingState} from '../providers/timing-context'
import {useInterval} from './use-interval'

export function useValidationTimer() {
  const timing = useTimingState()
  const epoch = useEpochState()

  const [state, dispatch] = React.useReducer(
    (prevState, name) => {
      switch (name) {
        default:
        case 'start': {
          const {nextValidation} = epoch
          const {shortSession, longSession} = timing
          const shortSessionEnd = dayjs(nextValidation).add(shortSession, 's')
          const longSessionEnd = dayjs(nextValidation).add(
            shortSession + longSession,
            's'
          )
          return {
            ...prevState,
            shortSessionEnd,
            longSessionEnd,
            secondsLeftForShortSession: Math.max(
              shortSessionEnd.diff(dayjs(), 's'),
              0
            ),
            secondsLeftForLongSession: Math.max(
              longSessionEnd.diff(dayjs(), 's'),
              0
            ),
          }
        }
        case 'tick': {
          return {
            ...prevState,
            secondsLeftForShortSession: Math.max(
              prevState.shortSessionEnd.diff(dayjs(), 's'),
              0
            ),
            secondsLeftForLongSession: Math.max(
              prevState.longSessionEnd.diff(dayjs(), 's'),
              0
            ),
          }
        }
      }
    },
    {
      shortSessionEnd: null,
      longSessionEnd: null,
      secondsLeftForShortSession: null,
      secondsLeftForLongSession: null,
    }
  )

  useEffect(() => {
    if (epoch && Object.keys(timing).length) {
      dispatch('start')
    }
  }, [epoch, timing])

  useInterval(
    () => dispatch('tick'),
    state.secondsLeftForShortSession + state.secondsLeftForLongSession > 0
      ? 1000
      : null
  )

  return state
}

export default useValidationTimer
