import {stripHexPrefix, toHexString} from '../utils/buffers'
import root from './proto/models_pb'

export class Ad {
  constructor({id, title, url, cover, author}) {
    this.id = id
    this.title = title
    this.url = url
    this.cover = cover
    this.author = author
  }

  static fromBytes = bytes => {
    const protoAd = root.ProtoAd.deserializeBinary(bytes)
    return new Ad({
      ...protoAd.toObject(),
      cover: URL.createObjectURL(
        new Blob([protoAd.getCover()], {type: 'image/png'})
      ),
    })
  }

  static fromHex = hex => Ad.fromBytes(Buffer.from(stripHexPrefix(hex), 'hex'))

  toBytes() {
    const data = new root.ProtoAd()

    data.setId(this.id)
    data.setTitle(this.title)
    data.setUrl(this.url)
    data.setCover(this.cover)
    data.setAuthor(this.author)

    return data.serializeBinary()
  }

  toHex() {
    return toHexString(this.toBytes(), true)
  }
}
