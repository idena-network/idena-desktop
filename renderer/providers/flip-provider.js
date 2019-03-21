import React, {Component, createContext, useState, useEffect} from 'react'
import {decode} from 'rlp'
import {fromHexString} from '../utils/string'
import {fetchFlip} from '../services/api'
import axios from 'axios'

const toFlip = ({id, url}) => ({id, url})

const FlipContext = createContext()

export const FlipProvider = ({children}) => {
  const [flips, setFlips] = useState([])

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const {data} = await axios('https://jsonplaceholder.typicode.com/photos')
      if (!ignore) {
        const mappedFlips = data.map(toFlip)
        setFlips([
          mappedFlips.slice(0, 10),
          mappedFlips.slice(10, 20),
          mappedFlips.slice(20, 30),
        ])
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
