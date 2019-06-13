import {useState, useEffect} from 'react'
import useEpoch, {EpochPeriod} from './useEpoch'
import FlipType from '../../screens/flips/shared/types/flip-type'
import * as api from '../../screens/validation/shared/api/validation-api'

const {getValidation, saveValidation} = global.validationStore || {}
const {getFlips, saveFlips} = global.flipStore || {}

const initialValidation = {
  startedAt: null,
  running: false,
  shortAnswers: [],
  longAnswers: [],
}

function useValidation() {
  const {currentPeriod} = useEpoch()

  const [validation, setValidation] = useState(initialValidation)

  useEffect(() => {
    const currentValidation = getValidation()
    setValidation(currentValidation)
  }, [])

  useEffect(() => {
    if (currentPeriod) {
      if (currentPeriod === EpochPeriod.None) {
        // eslint-disable-next-line no-use-before-define
        resetEpoch()
        setValidation(initialValidation)
      } else {
        setValidation(prevValidation => ({
          ...prevValidation,
          startedAt:
            currentPeriod === EpochPeriod.FlipLottery ? Date.now() : null,
          running: currentPeriod !== EpochPeriod.None,
        }))
      }
    }
  }, [currentPeriod])

  const submitShortAnswers = answers => {
    api.submitShortAnswers(answers, 0, 0)
    console.log('submitShortAnswers', answers)
    setValidation(prevValidation => ({
      ...prevValidation,
      shortAnswers: answers,
    }))
  }

  const submitLongAnswers = answers => {
    api.submitLongAnswers(answers, 0, 0)
    console.log('submitLongAnswers', answers)
    setValidation(prevValidation => ({
      ...prevValidation,
      longAnswers: answers,
    }))
  }

  const resetEpoch = () => {
    const flipsToArchive = getFlips()
      .filter(f => f.type !== FlipType.Archived)
      .map(flip => ({
        ...flip,
        type: FlipType.Archived,
      }))
    // console.log(flipsToArchive)
    // saveFlips(flipsToArchive)
    // resetKeywords()
  }

  useEffect(() => {
    console.log('saveValidation', validation)
    if (validation.shortAnswers.length || validation.longAnswers.length) {
      saveValidation(validation)
    }
  }, [validation])

  return {...validation, submitShortAnswers, submitLongAnswers}
}

export default useValidation
