/* eslint-disable import/prefer-default-export */

export function isValidationRunning(period) {
  return period && period.toLowerCase() !== 'none'
}

export const sessionRunning = currentPeriod =>
  currentPeriod === 'ShortSession' || currentPeriod === 'LongSession'

export const shortSessionRunning = currentPeriod =>
  currentPeriod === 'ShortSession'

export const longSessionRunning = currentPeriod =>
  currentPeriod === 'LongSession'

export const flipLotteryRunning = currentPeriod =>
  currentPeriod === 'FlipLottery'
