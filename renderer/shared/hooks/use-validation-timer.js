import React, {useEffect} from 'react'
import dayjs from 'dayjs'
import {useEpochState} from '../providers/epoch-context'
import {useTimingState} from '../providers/timing-context'
import {useInterval} from './use-interval'

const GAP = 10

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
          const shortSessionEnd = dayjs(nextValidation)
            .add(shortSession, 's')
            .subtract(GAP, 's')
          const longSessionEnd = shortSessionEnd.add(longSession, 's')
          return {
            ...prevState,
            shortSessionEnd,
            longSessionEnd,
            secondsLeftForShortSession: Math.max(
              0,
              shortSessionEnd.diff(dayjs(), 's')
            ),
            secondsLeftForLongSession: Math.max(
              0,
              longSessionEnd.diff(dayjs(), 's')
            ),
          }
        }
        case 'tick': {
          return {
            ...prevState,
            secondsLeftForShortSession: Math.max(
              0,
              prevState.shortSessionEnd.diff(dayjs(), 's')
            ),
            secondsLeftForLongSession: Math.max(
              0,
              prevState.longSessionEnd.diff(dayjs(), 's')
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
