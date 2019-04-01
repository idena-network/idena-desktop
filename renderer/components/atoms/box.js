/* eslint-disable react/require-default-props */
/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'

export const StyleDim = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
])

export const Box = ({bg, m, p, w, children}) => (
  <div>
    {children}
    <style jsx>{`
      div {
        background: ${bg};
        display: block;
        ${m && `margin: ${m}`};
        ${p && `padding: ${p}`};
        width: ${w < 12 ? `${(w / 12) * 100}%` : `${w}%`};
      }
    `}</style>
  </div>
)

Box.propTypes = {
  bg: PropTypes.string,
  m: StyleDim,
  p: StyleDim,
  w: StyleDim,
  children: PropTypes.node,
}
