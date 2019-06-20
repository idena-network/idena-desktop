import {useState, useEffect, useCallback, useRef} from 'react'
import useEpoch, {EpochPeriod} from './useEpoch'
import * as api from '../../screens/validation/shared/api/validation-api'
import useFlips from './useFlips'

const {getValidation, saveValidation} = global.validationStore || {}

function useValidation() {
  const {epoch, currentPeriod} = useEpoch()
  const {archiveFlips} = useFlips()

  const [shortAnswers, setShortAnswers] = useState([])
  const [longAnswers, setLongAnswers] = useState([])
  const [running, setRunning] = useState(false)

  const savedEpoch = useRef()

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const {shortAnswers, longAnswers, epoch} = getValidation()
    setShortAnswers(shortAnswers)
    setLongAnswers(longAnswers)
    savedEpoch.current = epoch
  }, [])

  useEffect(() => {
    function resetValidation() {
      setShortAnswers([])
      setLongAnswers([])
      setRunning(false)
    }

    function resetKeywords() {
      // TODO: implement reset keywords
    }

    console.info(epoch, savedEpoch.current)
    if (epoch && epoch !== savedEpoch.current) {
      console.info('Starting new epoch', epoch)
      savedEpoch.current = epoch
      resetValidation()
      archiveFlips()
      // resetKeywords()
    }
  }, [archiveFlips, epoch])

  useEffect(() => {
    setRunning(
      [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
        currentPeriod
      )
    )
  }, [currentPeriod])

  useEffect(() => {
    if (epoch) {
      saveValidation({
        shortAnswers,
        longAnswers,
        running,
        epoch: savedEpoch.current,
      })
    }
  }, [epoch, longAnswers, running, shortAnswers])

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

export default useValidation
