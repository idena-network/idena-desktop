/* eslint-disable import/prefer-default-export */
import api from './api-client'
import {strip} from '../utils/obj'

export async function sendInvite(addr, amount) {
  const {data} = await api().post('/', {
    method: 'dna_sendInvite',
    params: [strip({to: addr, amount})],
    id: 1,
  })
  const {result} = data
  return result
}

export async function activateInvite(to, key) {
  const {data} = await api().post('/', {
    method: 'dna_activateInvite',
    params: [strip({to, key})],
    id: 1,
  })
  const {result} = data
  return result
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
 * Epoch
 * @typedef {Object}
 * @property {String} epoch Current epoch
 * @property {String} nextValidation Next validation timestamp
 * @property {String} currentPeriod Current period
 */

/**
 * Fetches current epoch, next validation time and current period
 *
 * @returns {Epoch} Epoch details
 * @example
 * {
 *   "epoch": 184,
 *   "nextValidation": "2019-05-08T19:40:00+02:00",
 *   "currentPeriod": "None"
 * }
 */
export async function fetchEpoch() {
  const {data} = await api().post('/', {
    method: 'dna_epoch',
    params: [],
    id: 1,
  })
  const {result} = data
  return result
}

/**
 * Fetches timings specific to validation ceremony
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
  const {result} = data
  return result
}
