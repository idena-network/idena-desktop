/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'

export const StyleDim = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
])

export const Box = ({bg, m, p, w, css, ...props}) => (
  <>
    <div style={css} {...props} />
    <style jsx>{`
      div {
        background: ${bg};
        display: block;
        ${m && `margin: ${m}`};
        ${p && `padding: ${p}`};
        width: ${w < 12 ? `${(w / 12) * 100}%` : `${w}%`};
      }
    `}</style>
  </>
)

Box.propTypes = {
  bg: PropTypes.string,
  m: StyleDim,
  p: StyleDim,
  w: StyleDim,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}
