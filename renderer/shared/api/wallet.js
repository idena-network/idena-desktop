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
  const {data} = await api().post('/', {
    method: `dna_getBalance`,
    params: [address],
    id: 1,
  })
  // alert(JSON.stringify(data.result))
  return data.result

  alert(JSON.stringify(data))

  const b = data.result ? data.result.balance : 11
  const s = data.result ? data.result.stake : 234
  const balance = isStake ? s : b
  return balance
}
