import React, {useCallback} from 'react'
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
  const {data: identity, isLoading} = useRpc('dna_identity')
  const {data: balance} = useRpc(
    identity && 'dna_getBalance',
    identity && identity.address
  )

  const killMe = useCallback(
    async ({to}) => killIdentity(identity.address, to),
    [identity]
  )

  if (identity === null || isLoading) return null

  const {state, flips, requiredFlips} = identity

  const canActivateInvite = [
    IdentityStatus.Undefined,
    IdentityStatus.Killed,
    IdentityStatus.Invite,
  ].includes(state)

  const canSubmitFlip =
    [IdentityStatus.Newbie, IdentityStatus.Verified].includes(state) &&
    requiredFlips > 0 &&
    (flips || []).length < requiredFlips

  const canValidate = [
    IdentityStatus.Candidate,
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
    IdentityStatus.Suspended,
    IdentityStatus.Zombie,
  ].includes(state)

  const canTerminate = [
    IdentityStatus.Candidate,
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
    IdentityStatus.Suspended,
    IdentityStatus.Zombie,
  ].includes(state)

  const canMine = [IdentityStatus.Newbie, IdentityStatus.Verified].includes(
    state
  )

  return (
    <IdentityStateContext.Provider
      value={{
        ...identity,
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
