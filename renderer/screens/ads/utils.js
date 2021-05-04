import {dbProxy, createEpochDb} from '../../shared/utils/db'
import {callRpc} from '../../shared/utils/utils'
import {areSameCaseInsensitive, hexToObject} from '../oracles/utils'

export function createAdDb(epoch = -1) {
  const ns = [epoch, 'ads']

  const db = createEpochDb(...ns)

  const coverDbArgs = [['covers', ...ns], {valueEncoding: 'binary'}]

  return {
    async put({cover, ...ad}) {
      const id = await db.put(ad)
      if (cover) await dbProxy.put(id, cover, ...coverDbArgs)
      return id
    },
    async get(id) {
      return {
        ...(await db.get(id).catch(() => {})),
        cover: await dbProxy.get(id, ...coverDbArgs).catch(() => null),
      }
    },
    async getAsHex(id) {
      return dbProxy.get(id, ns, {
        valueEncoding: 'hex',
      })
    },
    async all() {
      return Promise.all(
        (await db.all()).map(async ({id, ...ad}) => ({
          id,
          cover: await dbProxy.get(id, ...coverDbArgs).catch(() => null),
          ...ad,
        }))
      )
    },
    del(id) {
      return db.del(id)
    },
    clear() {
      return db.clear()
    },
  }
}

export function buildProfile({ads}) {
  return {ads}
}

export function buildTargetKey({locale, age, stake, os = detectOs()}) {
  return JSON.stringify({locale, age, stake: Math.floor(stake), os})
}

export const isEligibleAd = (targetKey, key) => {
  const {
    locale: keyLocale,
    age: keyAge,
    stake: keyStake,
    os: keyOs,
  } = JSON.parse(key)

  const {locale, age, stake, os} = JSON.parse(targetKey)
  return (
    areSameCaseInsensitive(keyLocale, locale) &&
    age >= keyAge &&
    stake >= keyStake &&
    areSameCaseInsensitive(keyOs, os)
  )
}

export async function fetchProfileAds(address) {
  return hexToObject((await callRpc('dna_profile', address)).info).ads ?? []
}

export async function fetchTotalSpent(address) {
  return ((await callRpc('bcn_burntCoins')) ?? []).reduce(
    (total, {address: issuerAddress, amount}) =>
      total + areSameCaseInsensitive(issuerAddress, address)
        ? Number(amount)
        : 0,
    0
  )
}

export const buildAdReviewVoting = ({title}) => ({
  title: 'Is this ads propriate?',
  desc: title,
  startDate: Date.now(),
  votingDuration: 4320 * 3,
  publicVotingDuration: 2160,
  winnerThreshold: 66,
  quorum: 1,
  committeeSize: 100,
  votingMinPayment: 10,
  options: [
    {id: 0, value: 'Approve'},
    {id: 1, value: 'Reject'},
  ],
  ownerFee: 0,
})

export function detectOs() {
  switch (true) {
    case navigator.appVersion.includes('Win'):
      return 'win'
    case navigator.appVersion.includes('Mac'):
      return 'mac'
    case navigator.appVersion.includes('Linux'):
      return 'linux'
    case navigator.appVersion.includes('X11'):
      return 'unix'
    default:
      return undefined
  }
}
