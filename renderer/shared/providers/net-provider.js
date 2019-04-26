import React, {createContext, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {fetchAddress, fetchBalance} from '../services/api'
import {fetchIdentities} from '../api/dna'

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

  useEffect(() => {
    let ignore = false

    async function fetchInfo() {
      const addr = await fetchAddress()
      const balance = await fetchBalance(addr)
      const identities = await fetchIdentities(addr)
      const identity = identities.find(id => id.address === addr)

      if (!ignore) {
        setInfo({...identity, addr, balance, identities})
      }
    }

    fetchInfo()

    return () => {
      ignore = true
    }
  }, [])
  return <NetContext.Provider value={info}>{children}</NetContext.Provider>
}

NetProvider.propTypes = {
  children: PropTypes.node,
}

export default NetContext
