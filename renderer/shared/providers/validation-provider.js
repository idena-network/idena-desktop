import React, {createContext, useState, useEffect} from 'react'
import {fetchCeremonyIntervals} from '../api/dna'

const initialValidationStore = {
  markValidationStarted: null,
  markValidationFinished: null,
  saveShortAnswers: null,
  saveLongAnswers: null,
}

export const ValidationContext = createContext()

// eslint-disable-next-line react/prop-types
function ValidationProvider({children}) {
  const {
    markValidationStarted,
    markValidationFinished,
    saveShortAnswers,
    saveLongAnswers,
  } = global.validation || initialValidationStore

  const [shortAnswers, setShortAnswers] = useState()
  const [longAnswers, setLongAnswers] = useState()
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
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  const startValidation = () => {
    markValidationStarted()
  }

  const finishValidation = () => {
    markValidationFinished()
  }

  useEffect(() => {
    if (saveShortAnswers && shortAnswers) {
      saveShortAnswers()
    }
  }, [saveShortAnswers, shortAnswers])

  useEffect(() => {
    if (saveLongAnswers && longAnswers) {
      saveLongAnswers()
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
        timer: validationTimer,
        setTimer: setValidationTimer,
      }}
    >
      {children}
    </ValidationContext.Provider>
  )
}

export default ValidationProvider
