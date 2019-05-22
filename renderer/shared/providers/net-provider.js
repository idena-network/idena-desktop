import React, {createContext, useState, useEffect, useContext} from 'react'
import PropTypes from 'prop-types'
import {fetchAddress, fetchBalance} from '../services/api'
import {fetchIdentities, fetchEpoch} from '../api/dna'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {NotificationContext} from './notification-provider'

const initialState = {
  addr: '',
  balance: {
    stake: '',
    balance: '',
  },
}

const NetContext = createContext()

export const NetProvider = ({children}) => {
  const {onAddAlert, onClearAlert} = useContext(NotificationContext)

  const [info, setInfo] = useState(initialState)
  const [epoch, setEpoch] = useState()

  useEffect(() => {
    let ignore = false

    async function fetchInfo() {
      if (!ignore) {
        const addr = await fetchAddress()
        const balance = await fetchBalance(addr)
        const identities = await fetchIdentities(addr)
        const identity =
          identities && identities.length
            ? identities.find(id => id.address === addr)
            : {}

        const validated = identity && identity.state !== 'Undefined'

        setInfo({
          ...identity,
          validated,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useInterval(() => {
    let ignore = false

    async function fetchData() {
      if (!ignore) {
        try {
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
          onClearAlert()
        } catch (error) {
          onAddAlert({
            title: 'Cannot connect to node',
            body: error.message,
          })
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, null)

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
