import {useState, useEffect} from 'react'
import useEpoch, {EpochPeriod} from './useEpoch'
import useTiming from './useTiming'

const store = {
  getValidation() {
    return {
      startedAt: Date.now(),
      running: true,
      shortAnswers: [],
      longAnswers: [],
      finishedAt: null,
    }
  },
  saveValidation(nextState) {
    return nextState
  },
}

const initialValidation = {
  startedAt: null,
  running: false,
  shortAnswers: [],
  longAnswers: [],
  finishedAt: null,
}

function useValidation() {
  const {epoch, currentPeriod, nextValidation} = useEpoch()
  const {
    flipLottery: flipLotteryDuration,
    shortSession: shortSessionDuration,
    longSession: longSessionDuration,
    fullValidationSession: fullValidationSessionDuration,
  } = useTiming()

  const [validation, setValidation] = useState(initialValidation)

  const {getValidation, saveValidation} = store

  useEffect(() => {
    const savedValidation = getValidation()
    const {startedAt, finishedAt} = savedValidation

    const now = Date.now()
    const secondsPassed = Math.floor((now - startedAt) / 1000)

    const running = currentPeriod !== EpochPeriod.None
    const isValid = startedAt > now && now < finishedAt
    let secondsLeft

    if (running) {
      if (isValid) {
        const shortSessionOffset = flipLotteryDuration + shortSessionDuration
        const longSessionOffset = shortSessionOffset + longSessionDuration

        // 5 < 10
        if (currentPeriod === EpochPeriod.FlipLottery) {
          secondsLeft = flipLotteryDuration - secondsPassed
        }
        // 11 < 10 + 30
        else if (secondsPassed <= shortSessionOffset) {
          secondsLeft = shortSessionOffset - secondsPassed
        }
        // 41 < 10 + 30 + 60
        else if (secondsPassed <= longSessionOffset) {
          secondsLeft = longSessionOffset - secondsPassed
        }
        setValidation({...savedValidation, running, secondsLeft})
      } else {
        // the flow was broken
        setValidation({
          running,
          // nextValidation points to prev one when period is None
          startedAt: nextValidation,
          shortAnswers: [],
          longAnswers: [],
        })
      }
    }
  }, [
    currentPeriod,
    flipLotteryDuration,
    getValidation,
    longSessionDuration,
    nextValidation,
    shortSessionDuration,
  ])

  useEffect(() => {
    setValidation({
      running: false,
      startedAt:
        (Math.floor(Date.now() / 1000) - fullValidationSessionDuration) * 1000,
      shortAnswers: [],
      longAnswers: [],
      finishedAt: Date.now(),
    })
  }, [epoch, fullValidationSessionDuration])

  useEffect(() => {
    saveValidation(validation)
  }, [saveValidation, validation])

  return validation
}

export default useValidation
