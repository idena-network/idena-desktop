export function getImageURLFromClipboard(
  maxWidth = 147 * 2,
  maxHeight = 110 * 2
) {
  const img = global.clipboard.readImage()
  if (!img || img.isEmpty()) return

  const {width, height} = img.getSize()

  const ratio = img.getAspectRatio() || 1

  const newWidth = width > height ? maxWidth : maxHeight * ratio
  const newHeight = width < height ? maxHeight : maxWidth / ratio

  const nextImage =
    width > maxWidth || height > maxHeight
      ? img.resize({width: newWidth, height: newHeight})
      : img

  return nextImage.toDataURL()
}
