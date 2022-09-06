import root from './proto/models_pb'
import {stripHexPrefix} from '../utils/buffers'

export class ChangeProfileAttachment {
  constructor({cid}) {
    Object.assign(this, {cid})
  }

  static fromHex(hex) {
    return new ChangeProfileAttachment(
      root.ProtoChangeProfileAttachment.deserializeBinary(
        Buffer.from(stripHexPrefix(hex), 'hex')
      ).toObject()
    )
  }

  toHex() {
    const data = new root.ProtoChangeProfileAttachment()
    data.setCid(this.cid)

    return Buffer.from(data.serializeBinary()).toString('hex')
  }
}
