import {failIf} from '../../../shared/utils/fn'

export const Guard = {
  type(file) {
    failIf(
      file && !file.type.startsWith('image'),
      'File provided is not an image'
    )
  },
}

export default Guard
