import axios from 'axios'
import {useQuery} from 'react-query'
import {loadState} from '../utils/persist'

export const BASE_INTERNAL_API_PORT = 9119
export const BASE_API_URL = 'http://localhost:9009'

function getUrl() {
  const state = loadState('settings')
  if (!state) {
    return `http://localhost:${BASE_INTERNAL_API_PORT}`
  }
  if (!state.useExternalNode) {
    return `http://localhost:${state.internalPort}`
  }
  return state.url || BASE_API_URL
}

async function callRpc({method, params}) {
  const {result, error} = await (await fetch(getUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method,
      params,
      id: 1,
    }),
  })).json()

  if (error) throw new Error(error.message)

  return result
}

const defaultOptions = {
  refetchInterval: 3000,
}

export function useRpc(method, ...params) {
  return useQuery([`rpc/${method}`, {method, params}], callRpc, defaultOptions)
}

export default () =>
  axios.create({
    baseURL: getUrl(),
  })
