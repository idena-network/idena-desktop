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
 * @typedef {Object} Answer
 * @property {import('../providers/validation-context').AnswerType} answer Answer type enumeration: 0 - none, 1 - left, 2 - right, 3 - inappropriate
 * @property {boolean} easy Treat as not enough complex for validation or not
 *
 * @example {hash: "0x123", easy: false, answer: 1}
 */

/**
 * Submit answers for short session
 *
 * @property {Answer[]} answers List of answers
 * @property {number} nonce Nonce
 * @property {number} epoch Epoch
 *
 * @returns {string} Tx hash
 * @example
 *  submitShortAnswers({answers: [{answer: 1, easy: false}, {answer: 2, easy: false}], nonce: 0, epoch: 0})
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
 * @property {Answer[]} answers List of answers
 * @property {number} nonce Nonce
 * @property {number} epoch Epoch
 *
 * @returns {string} Tx hash
 * @example
 *  submitLongAnswers({answers: [{answer: 1, easy: false}, {answer: 2, easy: false}], nonce: 0, epoch: 0})
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
