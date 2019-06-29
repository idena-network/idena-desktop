/* eslint-disable import/prefer-default-export */
import api from './api-client'

/**
 * Fetch account list for a given node
 *
 * @returns {string[]} Accounts
 */
export async function fetchAccountList() {
  const {data} = await api().post('/', {
    method: `account_list`,
    params: [],
    id: 1,
  })
  const {result} = data
  return result
}

/**
 * Fetch balance for an address
 *
 * @returns {string} Address
 */
export async function fetchBalance(address) {
  const {data} = await api().post('/', {
    method: `dna_getBalance`,
    params: [address],
    id: 1,
  })
  const {result} = data
  return result
}
