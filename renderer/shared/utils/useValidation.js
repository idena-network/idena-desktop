import {useState, useEffect} from 'react'
import useEpoch from './useEpoch'
import useValidationTiming from './useValidationTiming'

export const ValidationStage = {
  FlipLottery: 'FlipLottery',
  ShortSession: 'ShortSession',
  LongSession: 'LongSession',
  AfterLongSession: 'AfterLongSession',
}

const initialValidation = {
  shortAnswers: [],
  longAnswers: [],
  startedAt: null,
  finishedAt: null,
  running: false,
  currentStage: {
    type: null,
    secondsLeft: null,
  },
}

const getCurrentValidation = () => initialValidation

function useValidation() {
  const {epoch} = useEpoch()
  const validationTiming = useValidationTiming()

  const [validation, setValidation] = useState(initialValidation)

  useEffect(() => {
    let ignore = false

    // eslint-disable-next-line no-shadow
    const savedValidation = getCurrentValidation()
    const {startedAt = epoch.nextValidation, finishedAt} = savedValidation
    let {running, currentStage} = savedValidation

    const now = Date.now()
    const secondsPassed = Math.floor((now - startedAt) / 1000)

    if (savedValidation && startedAt > now && now < finishedAt) {
      running = true

      const {
        flipLottery: flipLotteryDuration,
        shortSession: shortSessionDuration,
        longSession: longSessionDuration,
      } = validationTiming

      const shortSessionOffset = flipLotteryDuration + shortSessionDuration
      const longSessionOffset = shortSessionOffset + longSessionDuration

      // 5 < 10
      if (secondsPassed <= flipLotteryDuration) {
        currentStage = {
          type: ValidationStage.FlipLottery,
          secondsLeft: flipLotteryDuration - secondsPassed,
        }
      }
      // 11 < 10 + 30
      else if (secondsPassed <= shortSessionOffset) {
        currentStage = {
          type: ValidationStage.ShortSession,
          secondsLeft: shortSessionOffset - secondsPassed,
        }
      }
      // 41 < 10 + 30 + 60
      else if (secondsPassed <= longSessionOffset)
        currentStage = {
          type: ValidationStage.LongSession,
          secondsLeft: longSessionOffset - secondsPassed,
        }
    } else {
      running = false
    }

    if (!ignore) {
      setValidation({...savedValidation, running, currentStage})
    }

    return () => {
      ignore = true
    }
  }, [epoch, validationTiming])

  return validation

  // useEffect(() => {
  //   if (saveShortAnswers && shortAnswers) {
  //     saveShortAnswers(shortAnswers)
  //   }
  // }, [])

  // useEffect(() => {
  //   if (saveLongAnswers && longAnswers) {
  //     saveLongAnswers(longAnswers)
  //   }
  // }, [])

  // const startValidation = useCallback(() => {
  //   const {ShortSessionDuration, LongSessionDuration} = intervals
  //   markValidationStarted(ShortSessionDuration + LongSessionDuration)
  // }, [])

  // const finishValidation = useCallback(() => {
  //   markValidationFinished()
  //   deleteValidation()

  //   const {clearPublished: clearPublishedFlips} = global && global.flipStore
  //   if (clearPublishedFlips) {
  //     clearPublishedFlips()
  //   }
  // }, [])

  // useEffect(() => {
  //   const running = sessionRunning(currentPeriod)
  //   if (running && !running) {
  //     finishValidation()
  //   }
  //   if (!running && running) {
  //     startValidation()
  //   }
  //   setRunning(running)
  // }, [finishValidation, startValidation])
}

export default useValidation
