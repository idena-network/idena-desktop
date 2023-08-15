import {imageResize} from './img'

export function getImageURLFromClipboard(
  maxWidth = 147 * 2,
  maxHeight = 110 * 2
) {
  const img = global.clipboard.readImage()
  if (!img || img.isEmpty()) return

  return imageResize(img, maxWidth, maxHeight)
}

export function writeImageURLToClipboard(url) {
  const img = global.nativeImage.createFromDataURL(url)
  global.clipboard.writeImage(img)
}

export async function writeTextToClipboard(text) {
  try {
    await global.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy: ', err)
    return false
  }
}
