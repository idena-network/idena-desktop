import React, {createContext, useState, useEffect} from 'react'
import {fetchCeremonyIntervals} from '../api/dna'

const initialState = {
  shortSessionAnswersSubmitted: false,
  longSessionAnswersSubmitted: false,
  onSubmitShortAnswers: null,
  onSubmitLongAnswers: null,
  onTick: null,
}

export const ValidationContext = createContext(initialState)

// eslint-disable-next-line react/prop-types
function ValidationProvider({children}) {
  const [
    shortSessionAnswersSubmitted,
    setShortSessionAnswersSubmitted,
  ] = useState(false)

  const [
    longSessionAnswersSubmitted,
    setLongSessionAnswersSubmitted,
  ] = useState(false)

  const [intervals, setIntervals] = useState({})

  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      if (!ignore) {
        // eslint-disable-next-line no-shadow
        const intervals = await fetchCeremonyIntervals()

        const minIntervals = Object.entries(intervals)
          .map(([k, v]) => ({[k]: v / 60}))
          .reduce((curr, acc) => ({...acc, ...curr}), {})

        setIntervals(minIntervals)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  const onSubmitShortAnswers = () => {
    setShortSessionAnswersSubmitted(true)
  }

  const onSubmitLongAnswers = () => {
    setLongSessionAnswersSubmitted(true)
  }

  const onTick = sec => {
    setTimeLeft(sec)
  }

  return (
    <ValidationContext.Provider
      value={{
        shortSessionAnswersSubmitted,
        longSessionAnswersSubmitted,
        onSubmitShortAnswers,
        onSubmitLongAnswers,
        intervals,
        timeLeft,
        onTick,
      }}
    >
      {children}
    </ValidationContext.Provider>
  )
}

export default ValidationProvider
