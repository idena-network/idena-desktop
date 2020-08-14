import React, {useCallback} from 'react'
import deepEqual from 'dequal'
import {useInterval} from '../hooks/use-interval'
import {fetchIdentity, killIdentity} from '../api'
import {IdentityStatus} from '../types'
import useRpc from '../hooks/use-rpc'
import {useAppMachine} from './app-context'

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
      try {
        const fetchedIdentity = await fetchIdentity()
        if (!ignore) {
          setIdentity(fetchedIdentity)
        }
      } catch (error) {
        global.logger.error(
          'An error occured while fetching identity',
          error.message
        )
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [callRpc])

  useInterval(
    async () => {
      async function fetchData() {
        try {
          const nextIdentity = await fetchIdentity()
          if (!deepEqual(identity, nextIdentity)) {
            const state =
              identity &&
              identity.state === IdentityStatus.Terminating &&
              nextIdentity &&
              nextIdentity.state !== IdentityStatus.Undefined // still mining
                ? identity.state
                : nextIdentity.state
            setIdentity({...nextIdentity, state})
          }
        } catch (error) {
          global.logger.error(
            'An error occured while fetching identity',
            error.message
          )
        }
      }

      await fetchData()
    },
    identity ? 1000 * 5 : 1000 * 10
  )

  useInterval(
    () => callRpc('dna_getBalance', identity.address),
    identity && identity.address ? 1000 * 10 : null,
    true
  )

  const canActivateInvite =
    identity &&
    [IdentityStatus.Undefined, IdentityStatus.Invite].includes(identity.state)

  const canSubmitFlip =
    identity &&
    [
      IdentityStatus.Newbie,
      IdentityStatus.Verified,
      IdentityStatus.Human,
    ].includes(identity.state) &&
    identity.requiredFlips > 0 &&
    (identity.flips || []).length < identity.availableFlips

  // eslint-disable-next-line no-shadow
  const canValidate =
    identity &&
    [
      IdentityStatus.Candidate,
      IdentityStatus.Newbie,
      IdentityStatus.Verified,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
      IdentityStatus.Human,
    ].includes(identity.state)

  const canTerminate =
    identity &&
    [
      IdentityStatus.Verified,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
      IdentityStatus.Human,
    ].includes(identity.state)

  const canMine =
    identity &&
    [
      IdentityStatus.Newbie,
      IdentityStatus.Verified,
      IdentityStatus.Human,
    ].includes(identity.state)

  const killMe = useCallback(
    async ({to}) => {
      const resp = await killIdentity(identity.address, to)
      const {result} = resp

      if (result) {
        setIdentity({...identity, state: IdentityStatus.Terminating})
        return result
      }
      return resp
    },
    [identity]
  )

  return (
    <IdentityStateContext.Provider
      value={{
        ...identity,
        balance: balanceResult && balanceResult.balance,
        canActivateInvite,
        canSubmitFlip,
        canValidate,
        canMine,
        canTerminate,
      }}
    >
      <IdentityDispatchContext.Provider value={{killMe}}>
        {children}
      </IdentityDispatchContext.Provider>
    </IdentityStateContext.Provider>
  )
}

export function useIdentityState() {
  const [{context}] = useAppMachine()
  return context.identity
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

export function canValidate(identity) {
  if (!identity) {
    return false
  }

  const {requiredFlips, flips, state} = identity

  const numOfFlipsToSubmit = requiredFlips - (flips || []).length
  const shouldSendFlips = numOfFlipsToSubmit > 0

  return (
    ([
      IdentityStatus.Human,
      IdentityStatus.Verified,
      IdentityStatus.Newbie,
    ].includes(state) &&
      !shouldSendFlips) ||
    [
      IdentityStatus.Candidate,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
    ].includes(state)
  )
}

export {IdentityProvider, useIdentityDispatch}
