/* eslint-disable import/prefer-default-export */
import api from './api-client'

export async function getEnode() {
  const {data} = await api().post('/', {
    method: 'net_enode',
    id: 1,
  })
  return data.result
}

export async function addPeer(url) {
  const {data} = await api().post('/', {
    method: 'net_addPeer',
    params: [url],
    id: 1,
  })
  return data
}
