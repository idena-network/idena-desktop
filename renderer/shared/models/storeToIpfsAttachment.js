import root from './proto/models_pb'
import {stripHexPrefix} from '../utils/buffers'

export class StoreToIpfsAttachment {
  constructor({size, cid}) {
    Object.assign(this, {size, cid})
  }

  static fromBytes(bytes) {
    return new StoreToIpfsAttachment(
      root.ProtoStoreToIpfsAttachment.deserializeBinary(bytes).toObject()
    )
  }

  static fromHex(hex) {
    return StoreToIpfsAttachment.fromBytes(
      Buffer.from(stripHexPrefix(hex), 'hex')
    )
  }

  toBytes() {
    const data = new root.ProtoStoreToIpfsAttachment()

    data.setSize(this.size)
    data.setCid(this.cid)

    return data.serializeBinary()
  }

  toHex() {
    return Buffer.from(this.toBytes()).toString('hex')
  }
}
