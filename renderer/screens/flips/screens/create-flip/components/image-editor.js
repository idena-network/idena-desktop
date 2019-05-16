import React from 'react'
import PropTypes from 'prop-types'

function ImageEditor({src}) {
  return <img src={src} alt={src} height={400} />
}

ImageEditor.propTypes = {
  src: PropTypes.string,
}

export default ImageEditor
