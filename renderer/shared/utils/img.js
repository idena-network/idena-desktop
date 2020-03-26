import PropTypes from 'prop-types'

export function imageResize(
  img,
  maxWidth = 400,
  maxHeight = 300,
  softResize = true
) {
  if (!img || img.isEmpty()) return
  const {width, height} = img.getSize()
  const {newWidth, newHeight} = resizing(
    width,
    height,
    maxWidth,
    maxHeight,
    softResize
  )
  const nextImage =
    width > maxWidth || height > maxHeight || !softResize
      ? img.resize({width: newWidth, height: newHeight})
      : img
  return nextImage.toDataURL()
}

export function resizing(
  width,
  height,
  maxWidth = 440,
  maxHeight = 330,
  softResize = true // no resize for small image
) {
  const ratio = height > 0 ? width / height : 1

  if (width > maxWidth || height > maxHeight) {
    const newWidth = width > height ? maxWidth : maxHeight * ratio
    const newHeight = width < height ? maxHeight : maxWidth / ratio
    return {newWidth, newHeight}
  }
  if (!softResize) {
    const newWidth = maxWidth / maxHeight < ratio ? maxWidth : maxHeight * ratio
    const newHeight =
      maxWidth / maxHeight > ratio ? maxHeight : maxWidth / ratio
    return {newWidth, newHeight}
  }
  return {width, height}
}

imageResize.propTypes = {
  img: PropTypes.object,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  softResize: PropTypes.bool,
}

resizing.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  softResize: PropTypes.bool,
}
