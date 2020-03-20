import {imageResize} from './img'

export function getImageURLFromClipboard(
  maxWidth = 147 * 2,
  maxHeight = 110 * 2
) {
  const img = global.clipboard.readImage()
  if (!img || img.isEmpty()) return

  return imageResize(img, maxWidth, maxHeight)
}
