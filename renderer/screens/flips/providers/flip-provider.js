import React, {createContext, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {decode} from 'rlp'
import {fromHexString} from '../../../shared/utils/string'
import {fetchFlip} from '../../../shared/services/api'

export const flipsStorageKey = 'idena-flips'

const initialState = {
  drats: [],
  published: [],
}

const FlipContext = createContext()

export function FlipProvider({children}) {
  const [flips, setFlips] = useState(initialState)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const hashes = JSON.parse(localStorage.getItem(flipsStorageKey)) || []
      const responses = await Promise.all(hashes.map(hash => fetchFlip(hash)))

      const fetchedFlips = responses.map(({result}) =>
        result ? decode(fromHexString(result.hex.substr(2)))[0] : []
      )

      if (!ignore) {
        setFlips({drafts: [], published: fetchedFlips})
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])
  return <FlipContext.Provider value={flips}>{children}</FlipContext.Provider>
}

FlipProvider.propTypes = {
  children: PropTypes.node,
}

export default FlipContext
