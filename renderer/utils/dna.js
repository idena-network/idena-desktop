/* eslint-disable import/prefer-default-export */

export function allowedToActivateInvite(status) {
  return !status || status === 'Undefined' || status === 'Invite'
}
