import React, {createContext, useState, useEffect} from 'react'
import {decode} from 'rlp'
import {fromHexString} from '../utils/string'
import {fetchFlip} from '../services/api'

const FlipContext = createContext()

export const FlipProvider = ({children}) => {
  const [flips, setFlips] = useState([])

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const hash = 'QmRacGdq6f2hj4H8A1hZkVQZ83MgHmsxKwfqn8QmWXiKyj'
      const {result} = await fetchFlip(hash)

      if (result) {
        const [flipPics, flipOrder] = decode(
          fromHexString(result.hex.substr(2))
        )

        if (!ignore) {
          setFlips([flipPics])
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
