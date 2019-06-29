import React from 'react'
import PropTypes from 'prop-types'
import FlipImage from './flip-image'

function ImageEditor({src}) {
  return <FlipImage src={src} size={400} />
}

ImageEditor.propTypes = {
  src: PropTypes.string,
}

export default ImageEditor
