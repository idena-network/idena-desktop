import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'

function FlipImage({src, size = 150, ...props}) {
  return (
    <div {...props}>
      <style jsx>{`
        div {
          background: url(${src}) no-repeat;
          background-size: contain;
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
}

export default FlipImage
