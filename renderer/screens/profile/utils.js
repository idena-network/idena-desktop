import {requestDb} from '../../shared/utils/db'

export function createProfileDb(epoch) {
  const db = global.sub(requestDb(), 'profile')
  const planNextValidationkey = `didPlanNextValidation!!${epoch.epoch}`

  return {
    getDidPlanNextValidation() {
      return db.get(planNextValidationkey)
    },
    putDidPlanNextValidation(value) {
      return db.put(planNextValidationkey, value)
    },
    clear() {
      return db.clear()
    },
  }
}
