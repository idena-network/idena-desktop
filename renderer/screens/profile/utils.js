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
