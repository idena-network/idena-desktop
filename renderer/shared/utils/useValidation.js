import {useState, useEffect} from 'react'
import useEpoch, {EpochPeriod} from './useEpoch'

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
}

function useValidation() {
  const {epoch, currentPeriod} = useEpoch()

  const [validation, setValidation] = useState(initialValidation)

  useEffect(() => {
    if (epoch) {
      // clearFlips()
      // resetKeywords
      setValidation(initialValidation)
    }
  }, [epoch])

  useEffect(() => {
    if (currentPeriod) {
      setValidation(prevValidation => ({
        ...prevValidation,
        startedAt:
          currentPeriod === EpochPeriod.FlipLottery ? Date.now() : null,
        running: currentPeriod !== EpochPeriod.None,
      }))
    }
  }, [currentPeriod])

  const submitShortAnswers = answers => {
    setValidation(prevValidation => ({
      ...prevValidation,
      shortAnswers: answers,
    }))
  }

  const submitLongAnswers = answers => {
    setValidation(prevValidation => ({
      ...prevValidation,
      longAnswers: answers,
    }))
  }

  useEffect(() => {
    // saveValidation(validation)
  }, [validation])

  return {...validation, submitShortAnswers, submitLongAnswers}
}

export default useValidation
