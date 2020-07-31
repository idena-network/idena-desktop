import axios from 'axios'
import {loadPersistentState} from '../utils/persist'

export const BASE_INTERNAL_API_PORT = 9119
export const BASE_API_URL = 'http://localhost:9009'

export function getRpcParams() {
  const state = loadPersistentState('settings')
  if (!state) {
    return {
      url: `http://localhost:${BASE_INTERNAL_API_PORT}`,
      key: state.internalApiKey,
    }
  }
  if (!state.useExternalNode) {
    return {
      url: `http://localhost:${state.internalPort}`,
      key: state.internalApiKey,
    }
  }
  return {
    url: state.url || BASE_API_URL,
    key: state.externalApiKey,
  }
}

export default function createApiClient() {
  const params = getRpcParams()
  const instance = axios.create({
    baseURL: params.url,
  })
  instance.interceptors.request.use(function(config) {
    config.data.key = params.key
    return config
  })
  return instance
}
