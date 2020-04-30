import axios from 'axios'
import apiClient from '../api/api-client'

export const DNA_LINK_VERSION = `v1`
export const DNA_NONCE_PREFIX = 'signin-'

export function isValidUrl(string) {
  try {
    // eslint-disable-next-line no-new
    new URL(string)
  } catch (_) {
    global.logger.error('Invalid URL', string)
    return false
  }

  return true
}

export function validDnaUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const endsWithVersion = /v\d{1,3}$/.test(parsedUrl.pathname)
    return endsWithVersion
  } catch {
    return false
  }
}

export function extractQuery(url) {
  const query = {
    callback_url: null,
    token: null,
    nonce_endpoint: null,
    authentication_endpoint: null,
  }

  const {searchParams} =
    typeof url === 'string' ? new URL(decodeURIComponent(url)) : url

  Object.keys(query).forEach(key => {
    query[key] = searchParams.get(key)
  })

  return query
}

export function composeCallbackUrl(inputUrl, signature) {
  const {callback_url: callbackUrl, token} =
    typeof inputUrl === 'object' ? inputUrl : extractQuery(inputUrl)

  const url = new URL(callbackUrl)

  url.searchParams.set('token', token)
  url.searchParams.set('sign', signature)

  return url
}

export async function startSession(nonceEndpoint, {token, address}) {
  const {data} = await axios.post(nonceEndpoint, {
    token,
    address,
  })

  const {error} = data

  if (error) throw new Error(error)

  const {
    data: {nonce},
  } = data

  if (nonce.startsWith(DNA_NONCE_PREFIX)) return nonce

  throw new Error(`You must start prefix with ${DNA_NONCE_PREFIX}`)
}

export async function signNonce(nonce) {
  const {
    data: {result, error},
  } = await apiClient().post('/', {
    method: 'dna_sign',
    params: [nonce],
    id: 1,
  })
  if (error) throw new Error(error)
  return result
}

export async function authenticate(authenticationEndpoint, {token, signature}) {
  const {data} = await axios.post(authenticationEndpoint, {
    token,
    signature,
  })

  const {error} = {data}

  if (error) throw new Error(error)

  const {
    data: {authenticated},
  } = data

  if (authenticated) return true

  throw new Error('Error authenticating identity')
}
