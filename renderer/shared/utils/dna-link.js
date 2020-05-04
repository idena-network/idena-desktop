import axios from 'axios'
import {margin} from 'polished'
import apiClient from '../api/api-client'
import {sendTransaction} from '../api'
import {bufferToHex} from './string'
import {Box} from '../components'
import theme, {rem} from '../theme'

export const DNA_LINK_VERSION = `v1`
export const DNA_NONCE_PREFIX = 'signin-'

export const DNA_SEND_CONFIRM_TRESHOLD = 0.05

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

export function parseQuery(url) {
  const {searchParams} =
    typeof url === 'string' ? new URL(decodeURIComponent(url)) : url

  return Array.from(searchParams.entries()).reduce(
    (acc, [k, v]) => ({...acc, [k]: v}),
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

export async function signNonce(nonce) {
  const {
    data: {result, error},
  } = await apiClient().post('/', {
    method: 'dna_sign',
    params: [nonce],
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

// eslint-disable-next-line react/prop-types
export function AlertText({textAlign = 'initial', ...props}) {
  return (
    <Box
      color={theme.colors.danger}
      style={{
        fontWeight: theme.fontWeights.medium,
        fontSize: rem(11),
        ...margin(rem(12), 0, 0),
        textAlign,
      }}
      {...props}
    />
  )
}
