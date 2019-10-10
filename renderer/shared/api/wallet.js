/* eslint-disable import/prefer-default-export */
import api from './api-client'
import {strip} from '../utils/obj'

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
export async function fetchBalance(address) {
  const {data} = await api().post('/', {
    method: `dna_getBalance`,
    params: [address],
    id: 1,
  })
  return data.result
}

export async function fetchTransactions(address, count) {
  const {data} = await api().post('/', {
    method: 'bcn_transactions',
    params: [
      strip({
        address,
        count,
      }),
    ],
    id: 1,
  })
  return data
}

export async function fetchPendingTransactions(address, count) {
  const {data} = await api().post('/', {
    method: 'bcn_pendingTransactions',
    params: [
      strip({
        address,
        count,
      }),
    ],
    id: 1,
  })
  return data
}
