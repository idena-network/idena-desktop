import root from './proto/models_pb'
import {stripHexPrefix} from '../utils/buffers'

export class BurnAttachment {
  constructor({key}) {
    Object.assign(this, {key})
  }

  static fromHex(hex) {
    return new BurnAttachment(
      root.ProtoBurnAttachment.deserializeBinary(
        Buffer.from(stripHexPrefix(hex), 'hex')
      ).toObject()
    )
  }

  toHex() {
    const data = new root.ProtoBurnAttachment()
    data.setKey(this.key)

    return Buffer.from(data.serializeBinary()).toString('hex')
  }
}
