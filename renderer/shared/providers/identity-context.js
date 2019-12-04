import React, {useCallback, useState, useEffect} from 'react'
import {killIdentity} from '../api'
import {useRpc} from '../api/api-client'

export const IdentityStatus = {
  Undefined: 'Undefined',
  Invite: 'Invite',
  Candidate: 'Candidate',
  Newbie: 'Newbie',
  Verified: 'Verified',
  Suspended: 'Suspended',
  Zombie: 'Zombie',
  Killed: 'Killed',
  Terminating: 'Terminating',
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

export function IdentityProvider(props) {
  const {data: identity} = useRpc('dna_identity')
  const {data: balance} = useRpc(
    identity && 'dna_getBalance',
    identity && identity.address
  )

  const [terminating, setTerminating] = useState(false)

  const killMe = useCallback(
    async ({to}) => {
      try {
        setTerminating(true)
        const {error} = await killIdentity(identity.address, to)
        if (error) throw error
      } catch (error) {
        setTerminating(false)
        throw error
      }
    },
    [identity]
  )

  useEffect(() => {
    if (
      identity &&
      identity.state === IdentityStatus.Undefined &&
      terminating
    ) {
      setTerminating(false)
    }
  }, [identity, terminating])

  const canActivateInvite =
    identity &&
    [
      IdentityStatus.Undefined,
      IdentityStatus.Killed,
      IdentityStatus.Invite,
    ].includes(identity.state)

  const canSubmitFlip =
    identity &&
    [IdentityStatus.Newbie, IdentityStatus.Verified].includes(identity.state) &&
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

  const canTerminate =
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

  return (
    <IdentityStateContext.Provider
      value={{
        ...identity,
        state: terminating
          ? IdentityStatus.Terminating
          : identity && identity.state,
        balance: balance && balance.balance,
        canActivateInvite,
        canSubmitFlip,
        canValidate,
        canMine,
        canTerminate,
      }}
    >
      <IdentityDispatchContext.Provider value={{killMe}} {...props} />
    </IdentityStateContext.Provider>
  )
}

export function useIdentityState() {
  const context = React.useContext(IdentityStateContext)
  if (context === undefined) {
    throw new Error('useIdentityState must be used within a IdentityProvider')
  }
  return context
}

export function useIdentityDispatch() {
  const context = React.useContext(IdentityDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useIdentityDispatch must be used within a IdentityProvider'
    )
  }
  return context
}

export function shouldValidate(identity) {
  if (!identity) {
    return false
  }

  const {requiredFlips, flips, state} = identity

  const numOfFlipsToSubmit = requiredFlips - (flips || []).length
  const shouldSendFlips = numOfFlipsToSubmit > 0

  return (
    ([IdentityStatus.Verified, IdentityStatus.Newbie].includes(state) &&
      !shouldSendFlips) ||
    [
      IdentityStatus.Candidate,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
    ].includes(state)
  )
}
