import {useState, useEffect, useCallback} from 'react'
import useEpoch, {EpochPeriod} from './useEpoch'
import * as api from '../../screens/validation/shared/api/validation-api'
import useFlips from './useFlips'

const {getValidation, saveValidation} = global.validationStore || {}

const initialValidation = {
  epoch: null,
  startedAt: null,
  running: false,
  shortAnswers: [],
  longAnswers: [],
}

function useValidation() {
  const {epoch, currentPeriod} = useEpoch()
  const {archiveFlips} = useFlips()

  const [validation, setValidation] = useState(initialValidation)

  useEffect(() => {
    const currentValidation = getValidation()
    if (currentValidation) {
      setValidation(currentValidation)
    }
  }, [])

  useEffect(() => {
    if (epoch && epoch !== validation.epoch) {
      console.info('=====================')
      console.info('YAY!!! STARTING NEW EPOCH!!!', epoch)
      console.info('=====================')

      setValidation(initialValidation)
      // resetKeywords()
      archiveFlips()

      saveValidation({...initialValidation, epoch})
    }
  }, [archiveFlips, epoch, validation.epoch])

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

  useEffect(() => {
    if (
      validation &&
      validation.shortAnswers.length &&
      validation.longAnswers.length
    ) {
      saveValidation(validation)
    }
  }, [validation])

  const submitShortAnswers = useCallback(answers => {
    api.submitShortAnswers(answers, 0, 0)
    setValidation(prevValidation => ({
      ...prevValidation,
      shortAnswers: answers,
    }))
  }, [])

  const submitLongAnswers = useCallback(answers => {
    api.submitLongAnswers(answers, 0, 0)
    setValidation(prevValidation => ({
      ...prevValidation,
      longAnswers: answers,
    }))
  }, [])

  return {...validation, submitShortAnswers, submitLongAnswers}
}

export default useValidation
