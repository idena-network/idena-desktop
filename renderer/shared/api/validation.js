/* eslint-disable import/prefer-default-export */
import api from './api-client'

/**
 * Flip hash
 * @typedef {Object} FlipHash
 * @property {string} hash Flip hash, repesenting it's address in the network
 * @property {boolean} ready Whether flip is ready to be showned or not
 */

/**
 * Returns list of flip hashes participating in validation session
 *
 * @param {string} type Type of the hash
 *
 * @returns {FlipHash[]} List of flip hashes
 *
 * @example [{hash: "0x123", ready: true}, {hash: "0x99999", ready: false}]
 */
export async function fetchFlipHashes(type) {
  const {data} = await api().post('/', {
    method: `flip_${type}Hashes`,
    params: [],
    id: 1,
  })
  const {result} = data
  return result
}

/**
 * Format used for submitting validation session answers
 * @typedef {Object} ValidationAnswer
 * @property {string} hash Flip hash
 * @property {boolean} easy Treat as not enough complex for validation or not
 * @property {number} answer Answer type enumeration: 0 - none, 1 - left, 2 - right, 3 - inappropriate
 *
 * @example {hash: "0x123", easy: false, answer: 1}
 */

/**
 * Submit answers for short session
 *
 * @property {ValidationAnswer[]} answers List of answers
 * @property {number} nonce Nonce
 * @property {number} epoch Epoch
 *
 * @returns {string} Tx hash
 * @example
 *  ({answers: [{hash: "0x123", easy: false, answer: 1}], nonce: 0, epoch: 0}) => '0xfe516a684f99c8f6ef7674a08a81eb6b856efd76141cf97eb83ee323897af7e8'
 */
export async function submitShortAnswers(answers, nonce, epoch) {
  const {data} = await api().post('/', {
    method: 'flip_submitShortAnswers',
    params: [{answers, nonce, epoch}],
    id: 1,
  })
  const {result} = data
  return result
}

/**
 * Submit answers for long session
 *
 * @param {SubmitAnswersInput} input
 *
 * @returns {string} Tx hash
 * @example 0xfe516a684f99c8f6ef7674a08a81eb6b856efd76141cf97eb83ee323897af7e8
 */
export async function submitLongAnswers(answers, nonce, epoch) {
  const {data} = await api().post('/', {
    method: 'flip_submitLongAnswers',
    params: [{answers, nonce, epoch}],
    id: 1,
  })
  const {result} = data
  return result
}
