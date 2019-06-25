import React from 'react'
import PropTypes from 'prop-types'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {fetchIdentity, killIdentity} from '../api'
import {useInviteDispatch} from './invite-context'
import {IdentityStatus} from '../utils/useIdentity'

const IdentityStateContext = React.createContext()
const IdentityDispatchContext = React.createContext()

function IdentityProvider({address, children}) {
  const {resetActivation} = useInviteDispatch()

  const [status, setStatus] = React.useState()

  React.useEffect(() => {
    let ignore = false

    if (address) {
      fetchIdentity(address).then(({state}) => {
        if (!ignore) {
          setStatus(state)
        }
      })
    }

    return () => {
      ignore = true
    }
  }, [address, status])

  useInterval(
    async () => {
      // eslint-disable-next-line no-shadow
      const identity = await fetchIdentity(address)
      const {state} = identity
      setStatus(state)
    },
    address ? 3000 : null,
    true
  )

  React.useEffect(() => {
    if (status && status === IdentityStatus.Candidate) {
      resetActivation()
    }
  }, [resetActivation, status])

  const canActivateInvite = [
    IdentityStatus.Undefined,
    IdentityStatus.Killed,
    IdentityStatus.Invite,
  ].includes(status)

  const killMe = () => {
    const {result, error} = killIdentity(address)
    if (result) {
      setStatus(IdentityStatus.Killed)
    } else {
      throw new Error(error.message)
    }
  }

  return (
    <IdentityStateContext.Provider
      value={{
        address,
        status,
        canActivateInvite,
      }}
    >
      <IdentityDispatchContext.Provider value={killMe}>
        {children}
      </IdentityDispatchContext.Provider>
    </IdentityStateContext.Provider>
  )
}

IdentityProvider.propTypes = {
  address: PropTypes.string.isRequired,
  children: PropTypes.node,
}

function useIdentityState() {
  const context = React.useContext(IdentityStateContext)
  if (context === undefined) {
    throw new Error('useIdentityState must be used within a IdentityProvider')
  }
  return context
}

function useIdentityDispatch() {
  const context = React.useContext(IdentityDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useIdentityDispatch must be used within a IdentityProvider'
    )
  }
  return context
}

export {IdentityProvider, useIdentityState, useIdentityDispatch}
