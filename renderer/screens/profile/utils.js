import dayjs from 'dayjs'
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
    clear() {
      return requestProfileDb().clear()
    },
  }
}
