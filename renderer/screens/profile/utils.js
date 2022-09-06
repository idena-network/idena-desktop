import {IdentityStatus} from '../../shared/types'
import {requestDb} from '../../shared/utils/db'
import {IdentityStatus} from '../../shared/types'

export function createProfileDb(epoch) {
  const requestProfileDb = () => global.sub(requestDb(), 'profile')

  const planNextValidationkey = `didPlanNextValidation!!${epoch?.epoch ?? -1}`

  return {
    getDidPlanNextValidation() {
      return requestProfileDb().get(planNextValidationkey)
    },
    putDidPlanNextValidation(value) {
      return requestProfileDb().put(planNextValidationkey, value)
    },
    getDidShowValidationResults() {
      return requestProfileDb().get(`didShowValidationResults!!${epoch?.epoch}`)
    },
    putDidShowValidationResults() {
      return requestProfileDb().put(
        `didShowValidationResults!!${epoch?.epoch}`,
        1
      )
    },
    clear() {
      return requestProfileDb().clear()
    },
  }
}

export function validateInvitationCode(code) {
  try {
    const raw = stripHexPrefix(code)
    const re = /[0-9A-Fa-f]{64}/g
    const match = raw.match(re)
    return match?.length && match[0] === raw
  } catch {
    return false
  }
}

export function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str
  }
  // eslint-disable-next-line no-use-before-define
  return isHexPrefixed(str) ? str.slice(2) : str
}

const isHexPrefixed = str => str.slice(0, 2) === '0x'

function calcPercent(age) {
  switch (age) {
    case 5:
      return 5
    case 6:
      return 4
    case 7:
      return 3
    case 8:
      return 2
    case 9:
      return 1
    default:
      return 100
  }
}

export function getStakingWarning(t, state, age) {
  if ([IdentityStatus.Candidate, IdentityStatus.Newbie].includes(state)) {
    return t(
      `I understand that I will lose 100% of the Stake if I fail or miss the upcoming validation`
    )
  }
  if (state === IdentityStatus.Verified) {
    return t(
      `I understand that I will lose 100% of the Stake if I fail the upcoming validation`
    )
  }
  if (state === IdentityStatus.Zombie && age >= 10) {
    return t(
      `I understand that I will lose 100% of the Stake if I miss the upcoming validation`
    )
  }
  if (state === IdentityStatus.Zombie && age < 10) {
    return t(
      `I understand that I will lose {{percent}}% of the Stake if I fail the upcoming validation. I also understand that I will lose 100% of the Stake if I miss the upcoming validation`,
      {percent: calcPercent(age)}
    )
  }
  if (state === IdentityStatus.Suspended && age < 10) {
    return t(
      `I understand that I will lose {{percent}}% of the Stake if I fail the upcoming validation`,
      {percent: calcPercent(age)}
    )
  }
  return null
}
