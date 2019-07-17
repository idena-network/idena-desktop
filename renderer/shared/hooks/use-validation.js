import {useState, useEffect, useCallback, useRef} from 'react'
import dayjs from 'dayjs'
import * as api from '../api/validation'
import useFlips from '../utils/useFlips'
import {useEpochState, EpochPeriod} from '../providers/epoch-context'
import {useTimingState} from '../providers/timing-context'
import {useInterval} from './use-interval'
import {SessionType} from '../providers/validation-context'

const {getValidation, saveValidation} = global.validationStore || {}

function useValidation() {
  const epoch = useEpochState()
  const {archiveFlips} = useFlips()

  const [shortAnswers, setShortAnswers] = useState([])
  const [longAnswers, setLongAnswers] = useState([])
  const [running, setRunning] = useState(false)

  const savedEpoch = useRef()

  useEffect(() => {
    const savedValidation = getValidation()
    if (savedValidation) {
      // eslint-disable-next-line no-shadow
      const {shortAnswers, longAnswers, epoch} = savedValidation
      setShortAnswers(shortAnswers)
      setLongAnswers(longAnswers)
      savedEpoch.current = epoch.epoch
    }
  }, [])

  useEffect(() => {
    function resetValidation() {
      setShortAnswers([])
      setLongAnswers([])
      setRunning(false)
    }

    if (epoch && epoch.epoch !== savedEpoch.current) {
      savedEpoch.current = epoch.epoch
      resetValidation()
      archiveFlips()
    }
  }, [archiveFlips, epoch])

  useEffect(() => {
    setRunning(
      epoch &&
        [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
          epoch.currentPeriod
        )
    )
  }, [epoch])

  useEffect(() => {
    if (epoch) {
      saveValidation({
        shortAnswers,
        longAnswers,
        epoch: savedEpoch.current,
      })
    }
  }, [epoch, longAnswers, shortAnswers])

  const submitShortAnswers = useCallback(answers => {
    api.submitShortAnswers(answers, 0, 0)
    setShortAnswers(answers)
  }, [])

  const submitLongAnswers = useCallback(answers => {
    api.submitLongAnswers(answers, 0, 0)
    setLongAnswers(answers)
  }, [])

  return {
    shortAnswers,
    longAnswers,
    running,
    submitShortAnswers,
    submitLongAnswers,
  }
}

const GAP = 10

export function useValidationTimer(type) {
  const [seconds, setSeconds] = useState()

  const {shortSession, longSession} = useTimingState()
  const epoch = useEpochState()

  useEffect(() => {
    if (epoch && shortSession && longSession) {
      const {currentValidationStart, nextValidation} = epoch

      const start = dayjs(currentValidationStart || nextValidation)
      const duration =
        type === SessionType.Short ? shortSession : shortSession + longSession
      const finish = start.add(duration, 's').subtract(GAP, 's')

      setSeconds(finish.isAfter(dayjs()) ? finish.diff(dayjs(), 's') : 0)
    }
  }, [epoch, shortSession, longSession, type])

  useInterval(() => setSeconds(seconds - 1), seconds > 0 ? 1000 : null)

  return seconds
}

export default useValidation
