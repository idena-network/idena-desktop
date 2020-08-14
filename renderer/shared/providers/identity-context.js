import {IdentityStatus} from '../types'
import {useAppMachine} from './app-context'

export function useIdentityState() {
  const [{context}] = useAppMachine()
  return context.identity
}

export function useIdentityDispatch() {
  const [, send] = useAppMachine()
  return {
    killMe: to => send('TERMINATE_IDENTITY', {to}),
  }
}

export function mapToFriendlyStatus(status) {
  switch (status) {
    case IdentityStatus.Undefined:
      return 'Not validated'
    default:
      return status
  }
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
