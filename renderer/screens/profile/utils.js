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

export function calculateInvitationRewardRatio(
  {startBlock, nextValidation},
  {highestBlock}
) {
  const endBlock =
    highestBlock + dayjs(nextValidation).diff(dayjs(), 'minute') * 3

  const t = (highestBlock - startBlock) / (endBlock - startBlock)

  return Math.max(1 - t ** 4 * 0.5, 0)
}
