import React, {createContext, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {fetchAddress, fetchBalance} from '../services/api'
import {fetchIdentities, fetchEpoch} from '../api/dna'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'

const initialState = {
  addr: '',
  balance: {
    stake: '',
    balance: '',
  },
}

const NetContext = createContext()

export const NetProvider = ({children}) => {
  const [info, setInfo] = useState(initialState)

  const [epoch, setEpoch] = useState()

  useInterval(() => {
    let ignore = false

    async function fetchData() {
      if (!ignore) {
        const epochResult = await fetchEpoch()
        const {currentPeriod, nextValidation} = epochResult
        const validationRunning = currentPeriod.toLowerCase() !== 'none'
        const secondsLeft =
          new Date(nextValidation).getTime() - new Date().getTime()
        const validationSoon = secondsLeft < 60 * 1000 && secondsLeft > 0

        setEpoch({
          ...epochResult,
          validationRunning,
          validationSoon,
          secondsLeft,
        })
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, null)

  useEffect(() => {
    let ignore = false

    async function fetchInfo() {
      const addr = await fetchAddress()
      const balance = await fetchBalance(addr)
      const identities = await fetchIdentities(addr)
      const identity =
        identities && identities.length
          ? identities.find(id => id.address === addr)
          : {}

      if (!ignore) {
        setInfo({
          ...identity,
          addr,
          balance,
          identities,
        })
      }
    }

    fetchInfo()

    return () => {
      ignore = true
    }
  }, [])
  return (
    <NetContext.Provider value={{...info, ...epoch}}>
      {children}
    </NetContext.Provider>
  )
}

NetProvider.propTypes = {
  children: PropTypes.node,
}

export default NetContext
