import {IdentityStatus} from '../../shared/types'

export const canKill = (knownIdentity, persistedIdentity) =>
  persistedIdentity?.state === IdentityStatus.Invite ||
  (Boolean(knownIdentity) &&
    [IdentityStatus.Newbie, IdentityStatus.Candidate].includes(
      persistedIdentity?.state
    ))
