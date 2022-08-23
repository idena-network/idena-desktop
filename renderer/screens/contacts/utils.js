import {IdentityStatus} from '../../shared/types'

export const canKill = (knownIdentity, persistedIdentity) =>
  persistedIdentity?.state === IdentityStatus.Invite ||
  (Boolean(knownIdentity) &&
    persistedIdentity?.state === IdentityStatus.Candidate)
