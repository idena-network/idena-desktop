import {useEffect, useState} from 'react'
import {fetchIdentity} from '../api'

export const IdentityStatus = {
  Undefined: 'Undefined',
  Invite: 'Invite',
  Candidate: 'Candidate',
  Newbie: 'Newbie',
  Verified: 'Verified',
  Suspend: 'Suspend',
  Zombie: 'Zombie',
  Killed: 'Killed',
}

export const mapToFriendlyStatus = status => {
  switch (status) {
    case IdentityStatus.Undefined:
      return 'Not validated'
    default:
      return status
  }
}

const initialIdentity = {
  address: '',
  nickname: '',
  stake: '',
  invites: 0,
  age: 0,
  state: '',
  friendlyStatus: '',
  pubkey: '',
  requiredFlips: 0,
  madeFlips: 0,
  totalQualifiedFlips: 0,
  totalShortFlipPoints: 0,
  flips: null,
  online: false,
  canSubmitFlip: false,
  canActivateInvite: false,
}

function useIdentity(address) {
  const [identity, setIdentity] = useState(initialIdentity)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      // eslint-disable-next-line no-shadow
      const identity = await fetchIdentity(address)
      if (!ignore) {
        const {state: status, requiredFlips, flips} = identity
        setIdentity({
          ...identity,
          friendlyStatus: mapToFriendlyStatus(status),
          validated: status === IdentityStatus.Verified,
          canSubmitFlip:
            [
              IdentityStatus.Candidate,
              IdentityStatus.Newbie,
              IdentityStatus.Verified,
            ].includes(status) &&
            requiredFlips > 0 &&
            (flips || []).length < requiredFlips,
          canActivateInvite: [
            IdentityStatus.Undefined,
            IdentityStatus.Killed,
            IdentityStatus.Invite,
          ].includes(status),
        })
      }
    }

    if (address) {
      fetchData()
    }

    return () => {
      ignore = true
    }
  }, [address])

  return identity
}

export default useIdentity
