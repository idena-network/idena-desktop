import {requestDb} from '../../shared/utils/db'

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
