/* eslint-disable import/prefer-default-export */
import api from './api-client'

/**
 * Fetch account list for a given node
 *
 * @returns {string[]} Accounts
 */
export async function fetchAccountList(address) {
  return [{address}, {address, isStake: true}]
  /*
  const {data} = await api().post('/', {
    method: `account_list`,
    params: [],
    id: 1,
  })
  const {result} = data
  return result
  */
}

/**
 * Fetch balance for an address
 *
 * @returns {number} Balance
 */
export async function fetchBalance(address, isStake) {
  const b = 123
  return {b}
  const {data} = await api().post('/', {
    method: `dna_getBalance`,
    params: [address],
    id: 1,
  })
  const balance = data.result ? data.result.balance : 0
  const stake = data.result ? data.result.stake : 0
  const result = isStake ? stake : balance
  return result
}
