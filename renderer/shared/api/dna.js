/* eslint-disable import/prefer-default-export */
import api from './api-client'
import {strip} from '../utils/obj'

export async function sendInvite({to, amount}) {
  const {data} = await api().post('/', {
    method: 'dna_sendInvite',
    params: [strip({to, amount})],
    id: 1,
  })
  return data
}

export async function activateInvite(to, key) {
  const {data} = await api().post('/', {
    method: 'dna_activateInvite',
    params: [strip({to, key})],
    id: 1,
  })
  return data
}

export async function fetchIdentities() {
  const {data} = await api().post('/', {
    method: 'dna_identities',
    params: [],
    id: 1,
  })
  const {result} = data
  return result
}

/**
 * Identity
 * @typedef {Object} Identity
 * @property {string} address
 * @property {string} nickname
 * @property {string} stake
 * @property {number} invites Invites available
 * @property {number} age
 * @property {string} state Identity state
 * @property {string} pubkey
 * @property {number} requiredFlips
 * @property {number} madeFlips
 * @property {string[]} flips
 * @property {number} totalQualifiedFlips
 * @property {number} totalShortFlipPoints
 * @property {boolean} online
 * @property {string} penalty
 */

/**
 * Fetch identity info for the address
 *
 * @param {string} address Address
 * @returns {Identity} Identity details
 */
export async function fetchIdentity(address) {
  const {data} = await api().post('/', {
    method: 'dna_identity',
    params: address ? [address] : [],
    id: 1,
  })
  const {result, error} = data
  if (error) throw new Error(error.message)
  return result
}

/**
 * Epoch
 * @typedef {Object} Epoch
 * @property {String} epoch Current epoch
 * @property {String} nextValidation Next validation timestamp
 * @property {String} currentPeriod Current period
 * @property {String} currentValidationStart Actual validation start time
 */

/**
 * Fetch current epoch information
 *
 * @returns {Epoch} Epoch details
 */
export async function fetchEpoch() {
  const {data} = await api().post('/', {
    method: 'dna_epoch',
    params: [],
    id: 1,
  })
  const {result, error} = data
  if (error) throw new Error(error.message)
  return result
}

/**
 * Fetch timings specific to validation ceremony
 * 
 * @returns {object}
 * @example {
    "ValidationInterval": 600,
    "FlipLotteryDuration": 60,
    "ShortSessionDuration": 60,
    "LongSessionDuration": 60,
    "AfterLongSessionDuration": 30
  }
 */
export async function fetchCeremonyIntervals() {
  const {data} = await api().post('/', {
    method: 'dna_ceremonyIntervals',
    params: [],
    id: 1,
  })
  const {result, error} = data
  if (error) throw new Error(error.message)
  return result
}

/**
 * Fetches coinbase address
 *
 * @returns {string} Address
 * @example 0xf228fa1e9236343c7d44283b5ffcf9ba50df37e8
 */
export async function fetchCoinbaseAddress() {
  const {data} = await api().post('/', {
    method: 'dna_getCoinbaseAddr',
    params: [],
    id: 1,
  })
  const {result, error} = data
  if (error) throw new Error(error.message)
  return result
}

/**
 * Flip object
 * @typedef {Object} Flip
 * @property {string} hex Binary encoded flip data, in hex format
 * @property {number} epoch Origin epoch when a flip was created
 */

/**
 * Fetches hex representation of the FLIP published in the network
 * @param {string} hash Flip hash
 * @returns {Flip} Encoded flip
 */
export async function fetchFlip(hash) {
  const {data} = await api().post('/', {
    method: 'flip_get',
    params: [hash],
    id: 1,
  })
  return data
}

export async function submitFlip(hex, publicHex, privateHex, pairId) {
  console.warn('hex will be depreacted soon, consider using pub/priv parts')
  const {data} = await api().post('/', {
    method: 'flip_submit',
    params: [{hex, pairId}],
    id: 1,
  })
  return data
}

export async function killIdentity(from, to) {
  const {data} = await api().post('/', {
    method: 'dna_sendTransaction',
    params: [
      {
        type: 3,
        from,
        to,
      },
    ],
    id: 1,
  })
  return data
}

export async function killInvitee(from, to) {
  const {data} = await api().post('/', {
    method: 'dna_sendTransaction',
    params: [
      {
        type: 10,
        from,
        to,
      },
    ],
    id: 1,
  })
  return data
}

export async function becomeOnline() {
  const {data} = await api().post('/', {
    method: 'dna_becomeOnline',
    params: [],
    id: 1,
  })
  return data
}

export async function becomeOffline() {
  const {data} = await api().post('/', {
    method: 'dna_becomeOffline',
    params: [],
    id: 1,
  })
  return data
}

export async function sendTransaction(from, to, amount) {
  const {data} = await api().post('/', {
    method: 'dna_sendTransaction',
    params: [
      strip({
        from,
        to,
        amount,
      }),
    ],
    id: 1,
  })
  return data
}

export async function fetchNodeVersion() {
  const {data} = await api().post('/', {
    method: 'dna_version',
    params: [],
    id: 1,
  })
  const {result, error} = data
  if (error) throw new Error(error.message)
  return result
}

export async function importKey(key, password) {
  const {data} = await api().post('/', {
    method: 'dna_importKey',
    params: [{key, password}],
    id: 1,
  })
  return data
}
