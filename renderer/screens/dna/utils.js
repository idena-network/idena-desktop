import axios from 'axios'
import apiClient from '../../shared/api/api-client'
import {sendTransaction} from '../../shared/api/dna'
import {bufferToHex} from '../../shared/utils/string'

export const DNA_LINK_VERSION = `v1`
export const DNA_NONCE_PREFIX = 'signin-'

export const DNA_SEND_CONFIRM_TRESHOLD = 0.05

export function isValidUrl(string) {
  try {
    return ['https:', 'http:', 'dna:'].includes(new URL(string).protocol)
  } catch (_) {
    global.logger.error('Invalid URL', string)
    return false
  }
}

export function isValidDnaUrl(url) {
  try {
    const parsedUrl = new URL(url)
    const endsWithVersion = /v\d{1,3}$/.test(parsedUrl.pathname)
    return endsWithVersion
  } catch {
    return false
  }
}

export function dnaLinkMethod(dnaUrl) {
  return new URL(dnaUrl).pathname.slice(2).split('/')[0]
}

export function extractQueryParams(url) {
  const {searchParams} = typeof url === 'string' ? new URL(url) : url

  return Array.from(searchParams).reduce(
    (acc, [k, v]) => ({...acc, [k]: decodeURIComponent(v)}),
    {}
  )
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

export async function signNonce(nonce, format) {
  const params = [nonce]
  if (format) {
    params.push(format)
  }
  const {
    data: {result, error},
  } = await apiClient().post('/', {
    method: 'dna_sign',
    params,
    id: 1,
  })
  if (error) throw new Error(error.message)
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

export async function sendDna({from, to, amount, comment}) {
  const {result, error} = await sendTransaction(
    from,
    to,
    amount,
    bufferToHex(new TextEncoder().encode(comment))
  )

  if (error) throw new Error(error.message)

  return result
}

export function appendTxHash(url, hash) {
  return appendParam(url, 'tx', hash)
}

export function appendParam(url, name, value) {
  const txUrl = new URL(url)
  txUrl.searchParams.append(name, value)
  return txUrl
}

export async function handleCallbackUrl(
  callbackUrl,
  callbackFormat,
  {onJson, onHtml}
) {
  switch (callbackFormat) {
    case 'json': {
      return onJson(
        await (
          await fetch(callbackUrl, {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          })
        ).json()
      )
    }
    default:
      return onHtml({
        url: typeof callbackUrl === 'string' ? callbackUrl : callbackUrl.href,
      })
  }
}
