import React from 'react'
import PropTypes from 'prop-types'

function FlipImage({src, size = 150, css}) {
  return (
    <>
      <img src={src} alt={'flip-image'} style={css} />
      <style jsx>{`
        img {
          background-size: cover;
          background-position: center center;
          width: ${`${size}px`};
          height: ${`${size}px`};
        }
      `}</style>
    </>
  )
}

FlipImage.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number,
  css: PropTypes.object,
}

export default FlipImage
