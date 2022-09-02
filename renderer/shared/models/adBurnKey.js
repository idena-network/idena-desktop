import root from './proto/models_pb'
import {stripHexPrefix} from '../utils/buffers'

export class AdBurnKey {
  constructor({cid, target}) {
    Object.assign(this, {cid, target})
  }

  static fromHex(hex) {
    try {
      return new AdBurnKey(
        root.ProtoAdBurnKey.deserializeBinary(
          Buffer.from(stripHexPrefix(hex), 'hex')
        ).toObject()
      )
    } catch {
      return new AdBurnKey({cid: null, target: null})
    }
  }

  toHex() {
    const data = new root.ProtoAdBurnKey()
    data.setCid(this.cid)
    data.setTarget(this.target)

    return Buffer.from(data.serializeBinary()).toString('hex')
  }
}
