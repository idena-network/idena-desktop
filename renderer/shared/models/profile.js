import {stripHexPrefix} from '../utils/buffers'
import root from './proto/models_pb'

export class Profile {
  constructor(profile) {
    this.ads = profile?.ads ?? []
  }

  static fromBytes = bytes =>
    new Profile({
      ads: root.ProtoProfile.deserializeBinary(bytes)
        .getAdsList()
        .map(ad => ad.toObject()),
    })

  static fromHex = hex =>
    Profile.fromBytes(Buffer.from(stripHexPrefix(hex), 'hex'))

  toBytes() {
    const protoProfile = new root.ProtoProfile()

    protoProfile.setAdsList(
      this.ads.map(ad => {
        const profileAd = new root.ProtoProfile.ProtoProfileAd()

        profileAd.setCid(ad.cid)
        profileAd.setTarget(ad.target)
        profileAd.setContract(ad.contract)
        profileAd.setAuthor(ad.author)

        return profileAd
      })
    )

    return protoProfile.serializeBinary()
  }

  toHex() {
    return Buffer.from(this.toBytes()).toString('hex')
  }
}
