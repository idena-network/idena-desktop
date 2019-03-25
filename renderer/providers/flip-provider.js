import React, {createContext, useState, useEffect} from 'react'
import {decode} from 'rlp'
import {fromHexString} from '../utils/string'
import {fetchFlip} from '../services/api'

export const flipsStorageKey = 'idena-flips'

const initialState = {
  drats: [],
  published: [],
}

const FlipContext = createContext()

export const FlipProvider = ({children}) => {
  const [flips, setFlips] = useState(initialState)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const hashes = JSON.parse(localStorage.getItem(flipsStorageKey)) || []
      const responses = await Promise.all(hashes.map(hash => fetchFlip(hash)))

      if (responses) {
        const fetchedFlips = responses.map(
          ({result}) => decode(fromHexString(result.hex.substr(2)))[0]
        )

        if (!ignore) {
          setFlips({drafts: [], published: fetchedFlips})
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])
  return <FlipContext.Provider value={flips}>{children}</FlipContext.Provider>
}

export default FlipContext
