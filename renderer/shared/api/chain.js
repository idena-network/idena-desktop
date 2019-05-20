/* eslint-disable import/prefer-default-export */
import api from './api-client'

export async function fetchTx(hash) {
  const {data} = await api().post('/', {
    method: 'bcn_transaction',
    params: [hash],
    id: 1,
  })
  const {result} = data
  return {hash, tx: result}
}
