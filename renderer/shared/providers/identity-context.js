import React from 'react'
import deepEqual from 'dequal'
import {useInterval} from '../hooks/use-interval'
import {fetchIdentity, killIdentity} from '../api'

export const IdentityStatus = {
  Undefined: 'Undefined',
  Invite: 'Invite',
  Candidate: 'Candidate',
  Newbie: 'Newbie',
  Verified: 'Verified',
  Suspended: 'Suspended',
  Zombie: 'Zombie',
  Killed: 'Killed',
}

export function mapToFriendlyStatus(status) {
  switch (status) {
    case IdentityStatus.Undefined:
      return 'Not validated'
    default:
      return status
  }
}

const IdentityStateContext = React.createContext()
const IdentityDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function IdentityProvider({children}) {
  const [identity, setIdentity] = React.useState(null)

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      if (!ignore) {
        setIdentity(await fetchIdentity())
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  useInterval(async () => {
    async function fetchData() {
      const nextIdentity = await fetchIdentity()
      if (!deepEqual(identity, nextIdentity)) {
        setIdentity(nextIdentity)
      }
    }

    fetchData()
  }, 1000 * 1)

  const canActivateInvite = [
    IdentityStatus.Undefined,
    IdentityStatus.Killed,
    IdentityStatus.Invite,
  ].includes(identity && identity.state)

  const canSubmitFlip =
    identity &&
    [
      IdentityStatus.Candidate,
      IdentityStatus.Newbie,
      IdentityStatus.Verified,
    ].includes(identity.state) &&
    identity.requiredFlips > 0 &&
    (identity.flips || []).length < identity.requiredFlips

  const canValidate =
    identity &&
    [
      IdentityStatus.Candidate,
      IdentityStatus.Newbie,
      IdentityStatus.Verified,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
    ].includes(identity.state)

  const canMine =
    identity &&
    [IdentityStatus.Newbie, IdentityStatus.Verified].includes(identity.state)

  const killMe = () => {
    const {result, error} = killIdentity(identity.address)
    if (result) {
      setIdentity({...identity, state: IdentityStatus.Killed})
    } else {
      throw new Error(error.message)
    }
  }

  return (
    <IdentityStateContext.Provider
      value={{
        ...identity,
        canActivateInvite,
        canSubmitFlip,
        canValidate,
        canMine,
      }}
    >
      <IdentityDispatchContext.Provider value={{killMe}}>
        {children}
      </IdentityDispatchContext.Provider>
    </IdentityStateContext.Provider>
  )
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
