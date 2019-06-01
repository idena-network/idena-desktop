import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import PropTypes from 'prop-types'
import {fetchCeremonyIntervals} from '../api/dna'
import NetContext from './net-provider'
import {
  isValidationRunning,
  shortSessionRunning,
  longSessionRunning,
  sessionRunning,
} from '../utils/validation'

const initialValidationStore = {
  markValidationStarted: null,
  markValidationFinished: null,
  saveShortAnswers: null,
  saveLongAnswers: null,
  getCurrentValidation: null,
}

const {
  markValidationStarted,
  markValidationFinished,
  saveShortAnswers,
  saveLongAnswers,
  getCurrentValidation,
  deleteValidation,
} = global.validationStore || initialValidationStore

export const ValidationContext = createContext()

function ValidationProvider({children}) {
  const {currentPeriod} = useContext(NetContext)

  const [shortAnswers, setShortAnswers] = useState()
  const [longAnswers, setLongAnswers] = useState()
  const [validationRunning, setValidationRunning] = useState(false)
  const [validationTimer, setValidationTimer] = useState()

  const [intervals, setIntervals] = useState({})

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      if (!ignore) {
        // eslint-disable-next-line no-shadow
        const intervals = await fetchCeremonyIntervals()

        const minIntervals = Object.entries(intervals)
          .map(([k, v]) => ({[k]: v}))
          .reduce((curr, acc) => ({...acc, ...curr}), {})

        setIntervals(minIntervals)

        if (getCurrentValidation) {
          // eslint-disable-next-line no-shadow
          const validation = getCurrentValidation()
          if (validation) {
            const {ShortSessionDuration, LongSessionDuration} = intervals
            let secondsLeft = Math.round((validation.ttl - Date.now()) / 1000)
            if (shortSessionRunning(currentPeriod)) {
              secondsLeft -= LongSessionDuration
            } else if (longSessionRunning(currentPeriod)) {
              secondsLeft -= ShortSessionDuration
            }
            if (secondsLeft > 0) {
              setShortAnswers(validation.shortAnswers)
              setLongAnswers(validation.longAnswers)
            }
            setValidationTimer(secondsLeft)
          }
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [currentPeriod, setValidationTimer, validationRunning])

  useEffect(() => {
    if (saveShortAnswers && shortAnswers) {
      saveShortAnswers(shortAnswers)
    }
  }, [shortAnswers])

  useEffect(() => {
    if (saveLongAnswers && longAnswers) {
      saveLongAnswers(longAnswers)
    }
  }, [longAnswers])

  const startValidation = useCallback(() => {
    const {ShortSessionDuration, LongSessionDuration} = intervals
    markValidationStarted(ShortSessionDuration + LongSessionDuration)
  }, [intervals])

  const finishValidation = useCallback(() => {
    markValidationFinished()
    deleteValidation()

    const {clearPublished: clearPublishedFlips} = global && global.flipStore
    if (clearPublishedFlips) {
      clearPublishedFlips()
    }
  }, [])

  useEffect(() => {
    const running = sessionRunning(currentPeriod)
    if (validationRunning && !running) {
      finishValidation()
    }
    if (!validationRunning && running) {
      startValidation()
    }
    setValidationRunning(running)
  }, [currentPeriod, finishValidation, startValidation, validationRunning])

  return (
    <ValidationContext.Provider
      value={{
        intervals,
        shortAnswers,
        longAnswers,
        startValidation,
        setShortAnswers,
        setLongAnswers,
        finishValidation,
        validationTimer,
        setValidationTimer,
        validationRunning,
      }}
    >
      {children}
    </ValidationContext.Provider>
  )
}

ValidationProvider.propTypes = {
  children: PropTypes.node,
}

export default ValidationProvider
