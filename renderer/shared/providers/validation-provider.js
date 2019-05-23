import React, {createContext, useState, useEffect} from 'react'
import useLocalStorage from 'react-use/lib/useLocalStorage'
import {fetchCeremonyIntervals} from '../api/dna'

export const ValidationContext = createContext()

// eslint-disable-next-line react/prop-types
function ValidationProvider({children}) {
  const [shortAnswers, setShortAnswers] = useLocalStorage(
    'idena/validation/shortAnswers'
  )
  const [longAnswers, setLongAnswers] = useLocalStorage(
    'idena/validation/longAnswers'
  )
  const [timer, setTimer] = useLocalStorage('idena/validation/timer')

  const [intervals, setIntervals] = useState({})

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

  return (
    <ValidationContext.Provider
      value={{
        intervals,
        shortAnswers,
        longAnswers,
        setShortAnswers,
        setLongAnswers,
        timer,
        setTimer,
      }}
    >
      {children}
    </ValidationContext.Provider>
  )
}

export default ValidationProvider
