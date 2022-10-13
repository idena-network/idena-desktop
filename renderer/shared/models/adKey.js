import {stripHexPrefix} from '../utils/buffers'
import root from './proto/models_pb'

export class AdTarget {
  constructor({language, age, os, stake}) {
    this.language = language
    this.age = age
    this.os = os
    this.stake = stake
  }

  static fromBytes = bytes => {
    const protoAdKey = root.ProtoAdTarget.deserializeBinary(bytes)
    return new AdTarget(protoAdKey.toObject())
  }

  static fromHex = hex =>
    AdTarget.fromBytes(Buffer.from(stripHexPrefix(hex), 'hex'))

  toBytes() {
    const data = new root.ProtoAdTarget()

    data.setLanguage(this.language)
    data.setAge(this.age)
    data.setOs(this.os)
    data.setStake(this.stake)

    return data.serializeBinary()
  }

  toHex() {
    return Buffer.from(this.toBytes()).toString('hex')
  }
}
