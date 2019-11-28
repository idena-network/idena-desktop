import axios from 'axios'
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

export default () =>
  axios.create({
    baseURL: getUrl(),
  })
