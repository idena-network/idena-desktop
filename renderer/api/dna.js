/* eslint-disable import/prefer-default-export */
import api from './setup'
import {strip} from '../utils/obj'

async function sendInvite(addr, amount) {
  const {data} = await api.post('/', {
    method: 'dna_sendInvite',
    params: [strip({to: addr, amount})],
    id: 1,
  })
  const {result} = data
  return result
}

export {sendInvite}
