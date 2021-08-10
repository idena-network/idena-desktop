import dayjs from 'dayjs'
import {getRpcParams} from '../api/api-client'
import {EpochPeriod} from '../types'

export const HASH_IN_MEMPOOL =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export function createRpcCaller({url, key}) {
  return async function(method, ...params) {
    const {result, error} = await (
      await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          params,
          id: 1,
          key,
        }),
      })
    ).json()
    if (error) throw new Error(error.message)
    return result
  }
}

export function callRpc(method, ...params) {
  return createRpcCaller(getRpcParams())(method, ...params)
}

export function toPercent(value) {
  return value.toLocaleString(undefined, {
    style: 'percent',
    maximumSignificantDigits: 4,
  })
}

export const toLocaleDna = (locale, options) => {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 18,
    ...options,
  })
  return value => `${formatter.format(value)} iDNA`
}

export const eitherState = (current, ...states) => states.some(current.matches)

export const merge = predicate => (...lists) =>
  lists.reduce(
    (agg, curr) =>
      agg.length
        ? agg.map(item => ({
            ...item,
            ...curr.find(predicate(item)),
          }))
        : curr,
    []
  )

export const byId = ({id: givenId}) => ({id: currentId}) =>
  currentId === givenId

export const mergeById = (...items) => merge(byId)(...items)

export function clampValue(min, max, value) {
  return Math.min(Math.max(value, min), max)
}

export function roundToPrecision(precision, value) {
  return (
    Math.ceil((Number(value) + Number.EPSILON) * 10 ** precision) /
    10 ** precision
  )
}

// the NTP algorithm
// t0 is the client's timestamp of the request packet transmission,
// t1 is the server's timestamp of the request packet reception,
// t2 is the server's timestamp of the response packet transmission and
// t3 is the client's timestamp of the response packet reception.
export function ntp(t0, t1, t2, t3) {
  return {
    roundTripDelay: t3 - t0 - (t2 - t1),
    offset: (t1 - t0 + (t2 - t3)) / 2,
  }
}

export function buildNextValidationCalendarLink(nextValidation) {
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${dayjs(
    nextValidation
  ).format('YYYYMMDDTHHmmssZ')}%2F${dayjs(nextValidation)
    .add(30, 'minute')
    .format(
      'YYYYMMDDTHHmmssZ'
    )}&details=Plan%20your%20time%20in%20advance%20to%20take%20part%20in%20the%20validation%20ceremony%21%20Before%20the%20ceremony%2C%20read%20our%20explainer%20of%20how%20to%20get%20validated%3A%20https%3A%2F%2Fmedium.com%2Fidena%2Fhow-to-pass-a-validation-session-in-idena-1724a0203e81&text=Idena%20Validation%20Ceremony`
}

export function formatValidationDate(nextValidation) {
  return new Date(nextValidation).toLocaleString([], {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export async function loadKeyword(index) {
  try {
    const {Name: name, Desc: desc} = await callRpc('bcn_keyWord', index)
    return {name, desc}
  } catch (error) {
    global.logger.error('Unable to receive keyword', index)
    return {name: '', desc: ''}
  }
}

export const dummyAddress = `0x${'2'.repeat(64)}`

export function showWindowNotification(title, notificationBody, onclick) {
  const notification = new window.Notification(title, {
    body: notificationBody,
  })
  notification.onclick = onclick
  return true
}

export function shouldShowUpcomingValidationNotification(
  epoch,
  upcomingValidationEpoch
) {
  if (!epoch) {
    return false
  }
  const isFlipLottery = epoch.currentPeriod === EpochPeriod.FlipLottery
  const currentEpoch = epoch.epoch
  const notificationShown = currentEpoch + 1 === upcomingValidationEpoch
  return isFlipLottery && !notificationShown
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

export const apiMethod = m => new URL(m, new URL('https://api.idena.io/api/'))
