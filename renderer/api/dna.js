/* eslint-disable import/prefer-default-export */
import api from './setup-api'
import {strip} from '../utils/obj'

export async function sendInvite(addr, amount) {
  const {data} = await api.post('/', {
    method: 'dna_sendInvite',
    params: [strip({to: addr, amount})],
    id: 1,
  })
  const {result} = data
  return result
}

export async function activateInvite(to, key) {
  const {data} = await api.post('/', {
    method: 'dna_activateInvite',
    params: [strip({to, key})],
    id: 1,
  })
  const {result} = data
  return result
}

export async function fetchIdentity(address) {
  const {data} = await api.post('/', {
    method: 'dna_identities',
    params: [],
    id: 1,
  })
  const {result} = data
  return result.find(id => id.address === address)
}
