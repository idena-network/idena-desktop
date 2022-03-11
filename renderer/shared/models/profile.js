import {stripHexPrefix, toHexString} from '../utils/buffers'
import root from './proto/models_pb'

export class Profile {
  constructor(profile) {
    this.ads = profile?.ads
  }

  static fromBytes = bytes =>
    new Profile({
      ads: root.ProtoProfile.deserializeBinary(bytes)
        .getAdsList()
        .map(ad => ({
          cid: ad.getCid(),
          votingAddress: ad.getVotingaddress(),
          key: ad.getKey().toObject(),
        })),
    })

  static fromHex = hex =>
    Profile.fromBytes(Buffer.from(stripHexPrefix(hex), 'hex'))

  toBytes() {
    const protoProfile = new root.ProtoProfile()

    protoProfile.setAdsList(
      this.ads.map(ad => {
        const profileAd = new root.ProtoProfile.ProtoProfileAd()
        profileAd.setCid(ad.cid)
        profileAd.setVotingaddress(ad.votingAddress)

        const adKey = new root.ProtoAdKey()
        adKey.setLanguage(ad.key.language)
        adKey.setOs(ad.key.os)
        adKey.setAge(ad.key.age)
        adKey.setStake(ad.key.stake)

        profileAd.setKey(adKey)

        return profileAd
      })
    )

    return protoProfile.serializeBinary()
  }

  toHex() {
    return toHexString(this.toBytes(), true)
  }
}
