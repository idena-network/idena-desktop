import React from 'react'
import PropTypes from 'prop-types'

function FlipImage({src, size = 150, css}) {
  return (
    <>
      <img src={src} alt="flip" style={css} />
      <style jsx>{`
        img {
          background-size: cover;
          background-position: center center;
          border-radius: 8px;
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
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export default FlipImage
