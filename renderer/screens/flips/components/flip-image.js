import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'

function FlipImage({src, size = 150, gradient = false, ...props}) {
  return (
    <div {...props}>
      <style jsx>{`
        div {
          background: ${gradient
              ? 'linear-gradient(to top, #ffa366, rgba(255, 163, 102, 0.5)),'
              : ''}
            url(${src}) center center no-repeat;
          background-size: cover;
          width: ${rem(size)};
          height: ${rem(size)};
        }
      `}</style>
    </div>
  )
}

FlipImage.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number,
  gradient: PropTypes.bool,
}

export default FlipImage
