import {adFallbackSrc} from '../../screens/ads/utils'
import {stripHexPrefix} from '../utils/buffers'
import root from './proto/models_pb'

export class Ad {
  constructor({title, desc, url, thumb, media, version, votingParams}) {
    Object.assign(this, {title, desc, url, thumb, media, version, votingParams})
  }

  static fromBytes = bytes => {
    const protoAd = root.ProtoAd.deserializeBinary(bytes)

    const thumb = protoAd.getThumb()
    const media = protoAd.getMedia()

    const votingParams = protoAd.getVotingparams()

    return new Ad({
      title: protoAd.getTitle(),
      desc: protoAd.getDesc(),
      url: protoAd.getUrl(),
      thumb: thumb ? URL.createObjectURL(new Blob([thumb])) : adFallbackSrc,
      media: media ? URL.createObjectURL(new Blob([media])) : adFallbackSrc,

      version: protoAd.getVersion(),

      votingParams: {
        votingDuration: votingParams.getVotingduration(),
        publicVotingDuration: votingParams.getPublicvotingduration(),
        quorum: votingParams.getQuorum(),
        committeeSize: votingParams.getCommitteesize(),
      },
    })
  }

  static fromHex = hex => Ad.fromBytes(Buffer.from(stripHexPrefix(hex), 'hex'))

  toBytes() {
    const data = new root.ProtoAd()

    data.setTitle(this.title)
    data.setDesc(this.desc)
    data.setUrl(this.url)
    data.setThumb(this.thumb)
    data.setMedia(this.media)

    data.setVersion(this.version)

    const votingParamsMessage = new root.ProtoAdVotingParams()

    const {
      votingDuration,
      publicVotingDuration,
      quorum,
      committeeSize,
    } = this.votingParams

    votingParamsMessage.setVotingduration(votingDuration)
    votingParamsMessage.setPublicvotingduration(publicVotingDuration)
    votingParamsMessage.setQuorum(quorum)
    votingParamsMessage.setCommitteesize(committeeSize)

    data.setVotingparams(votingParamsMessage)

    return data.serializeBinary()
  }

  toHex() {
    return Buffer.from(this.toBytes()).toString('hex')
  }
}
