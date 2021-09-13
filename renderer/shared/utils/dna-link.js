import axios from 'axios'
import apiClient from '../api/api-client'
import {sendTransaction} from '../api/dna'
import {bufferToHex} from './string'
import messages from '../proto/models_pb'
import {toBuffer, hexToUint8Array, toHexString, bufferToInt} from './buffers'

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
  const {searchParams} = typeof url === 'string' ? new URL(url) : url

  return Array.from(searchParams.entries()).reduce(
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

export function appendTxHash(url, hash) {
  const txUrl = new URL(url)
  txUrl.searchParams.append('tx', hash)
  return txUrl
}

export class Transaction {
  constructor(nonce, epoch, type, to, amount, maxFee, tips, payload) {
    this.nonce = nonce || 0
    this.epoch = epoch || 0
    this.type = type || 0
    this.to = to
    this.amount = amount || 0
    this.maxFee = maxFee || 0
    this.tips = tips || 0
    this.payload = payload
    this.signature = null
  }

  fromHex(hex) {
    return this.fromBytes(hexToUint8Array(hex))
  }

  fromBytes(bytes) {
    const protoTx = messages.ProtoTransaction.deserializeBinary(bytes)

    const protoTxData = protoTx.getData()
    this.nonce = protoTxData.getNonce()
    this.epoch = protoTxData.getEpoch()
    this.type = protoTxData.getType()
    this.to = toHexString(protoTxData.getTo(), true)
    this.amount = bufferToInt(protoTxData.getAmount())
    this.maxFee = bufferToInt(protoTxData.getMaxfee())
    this.tips = bufferToInt(protoTxData.getTips())
    this.payload = protoTxData.getPayload()

    this.signature = protoTx.getSignature()

    return this
  }

  toBytes() {
    const transaction = new messages.ProtoTransaction()
    transaction.setData(this._createProtoTxData())
    if (this.signature) {
      transaction.setSignature(toBuffer(this.signature))
    }
    return Buffer.from(transaction.serializeBinary())
  }

  toHex() {
    return this.toBytes().toString('hex')
  }

  _createProtoTxData() {
    const data = new messages.ProtoTransaction.Data()
    data
      .setNonce(this.nonce)
      .setEpoch(this.epoch)
      .setType(this.type)

    if (this.to) {
      data.setTo(toBuffer(this.to))
    }

    if (this.amount) {
      data.setAmount(toBuffer(this.amount))
    }
    if (this.maxFee) {
      data.setMaxfee(toBuffer(this.maxFee))
    }
    if (this.amount) {
      data.setTips(toBuffer(this.tips))
    }
    if (this.payload) {
      data.setPayload(toBuffer(this.payload))
    }

    return data
  }
}
