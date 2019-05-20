/* eslint-disable import/prefer-default-export */
import api from '../../../../shared/api/api-client'

/**
 * Fetch account list for a given node
 *
 * @returns {string[]} Accounts
 * @example ["0xb7d1f23705abecb50fdd010a881647227153b8ac"]
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
