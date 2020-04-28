import apiClient from '../api/api-client'

export const DNA_LINK_PREFIX = 'signintoken_'

export function validDnaUrl(url) {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return url.startsWith(DNA_LINK_PREFIX)
  } catch {
    return false
  }
}

export function extractQueryParams(url) {
  const extractedQueryParams = {
    callback_url: null,
    token: null,
    nonce: null,
  }

  const {searchParams} = new URL(decodeURIComponent(url))

  for (const key of Object.keys(extractedQueryParams)) {
    extractedQueryParams[key] = searchParams.get(key)
  }

  return extractedQueryParams
}

export function composeCallbackUrl(inputUrl, signature) {
  const {callback_url: callbackUrl, token} =
    typeof inputUrl === 'object' ? inputUrl : extractQueryParams(inputUrl)

  const url = new URL(callbackUrl)

  url.searchParams.set('token', token)
  url.searchParams.set('sign', signature)

  return url
}

export async function sign(token) {
  const {
    data: {result, error},
  } = await apiClient().post('/', {
    method: 'dna_sign',
    params: [token],
    id: 1,
  })
  if (error) throw new Error(error)
  return result
}
