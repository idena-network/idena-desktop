import React from 'react'
import deepEqual from 'dequal'
import {useInterval} from '../hooks/use-interval'
import {fetchIdentity, killIdentity} from '../api'
import useRpc from '../hooks/use-rpc'

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
  const [{result: balanceResult}, callRpc] = useRpc()

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      const fetchedIdentity = await fetchIdentity()
      callRpc('dna_getBalance', fetchedIdentity.address)
      if (!ignore) {
        setIdentity(fetchedIdentity)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [callRpc])

  useInterval(async () => {
    async function fetchData() {
      const nextIdentity = await fetchIdentity()
      if (!deepEqual(identity, nextIdentity)) {
        setIdentity(nextIdentity)
      }
    }

    fetchData()
  }, 1000 * 1)

  useInterval(
    () => callRpc('dna_getBalance', identity.address),
    identity && identity.address ? 1000 : null
  )

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
        balance: balanceResult && balanceResult.balance,
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
