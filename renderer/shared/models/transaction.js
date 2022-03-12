import BN from 'bn.js'
import messages from './proto/models_pb'
import {toBuffer, hexToUint8Array, toHexString} from '../utils/buffers'

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
    this.amount = new BN(protoTxData.getAmount())
    this.maxFee = new BN(protoTxData.getMaxfee())
    this.tips = new BN(protoTxData.getTips())
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

  toHex(withPrefix) {
    return (withPrefix ? '0x' : '') + this.toBytes().toString('hex')
  }

  _createProtoTxData() {
    const data = new messages.ProtoTransaction.Data()

    data.setNonce(this.nonce)
    data.setEpoch(this.epoch)
    data.setType(this.type)

    if (this.to) {
      data.setTo(toBuffer(this.to))
    }

    if (this.amount) {
      const num = new BN(this.amount)
      if (!num.isZero()) data.setAmount(toBuffer(num))
    }
    if (this.maxFee) {
      const num = new BN(this.maxFee)
      if (!num.isZero()) data.setMaxfee(toBuffer(num))
    }
    if (this.tips) {
      const num = new BN(this.tips)
      if (!num.isZero()) data.setTips(toBuffer(num))
    }
    if (this.payload) {
      data.setPayload(toBuffer(this.payload))
    }

    return data
  }
}
