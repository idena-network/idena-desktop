import {toHexString} from '../utils/buffers'
import messages from './proto/models_pb'

export class ProfileAd {
  constructor(cid, key, votingAddress) {
    this.cid = cid
    this.key = key
    this.votingAddress = votingAddress
  }

  toBytes() {
    const data = new messages.ProtoProfile.ProtoProfileAd()
    data.setCid(this.cid)
    data.setKey(this.key)
    data.setVotingaddress(this.votingAddress)

    return data.serializeBinary()
  }

  toHex() {
    return toHexString(this.toBytes(), true)
  }
}
