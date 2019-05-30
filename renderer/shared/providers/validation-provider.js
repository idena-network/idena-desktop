import React, {createContext, useState, useEffect} from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import {fetchCeremonyIntervals} from '../api/dna'

const initialValidationStore = {
  markValidationStarted: null,
  markValidationFinished: null,
  saveShortAnswers: null,
  saveLongAnswers: null,
  getCurrentValidation: null,
}

export const ValidationContext = createContext()

// eslint-disable-next-line react/prop-types
function ValidationProvider({children}) {
  const {
    markValidationStarted,
    markValidationFinished,
    saveShortAnswers,
    saveLongAnswers,
    getCurrentValidation,
  } = global.validationStore || initialValidationStore

  const [shortAnswers, setShortAnswers] = useState()
  const [longAnswers, setLongAnswers] = useState()
  const [validationTimer, setValidationTimer] = useLocalStorage()

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
            setShortAnswers(validation.shortAnswers)
            setLongAnswers(validation.longAnswers)
          }
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [getCurrentValidation])

  const startValidation = () => {
    const {
      ShortSessionDuration,
      LongSessionDuration,
      AfterLongSessionDuration,
    } = intervals
    markValidationStarted(
      ShortSessionDuration + LongSessionDuration + AfterLongSessionDuration
    )
  }

  const finishValidation = () => {
    markValidationFinished()
  }

  useEffect(() => {
    if (saveShortAnswers && shortAnswers) {
      saveShortAnswers(shortAnswers)
    }
  }, [shortAnswers, saveShortAnswers])

  useEffect(() => {
    if (saveLongAnswers && longAnswers) {
      saveLongAnswers(longAnswers)
    }
  }, [longAnswers, saveLongAnswers])

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
      }}
    >
      {children}
    </ValidationContext.Provider>
  )
}

export default ValidationProvider
