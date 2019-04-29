import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'

export const Dim = PropTypes.oneOfType([PropTypes.string, PropTypes.number])

function Box({bg, m, p, w, css: style, ...props}) {
  return (
    <>
      <div style={style} {...props} />
      <style jsx>{`
        div {
          background: ${bg};
          display: block;
          ${m && `margin: ${m}`};
          ${p && `padding: ${p}`};
          ${w && `width: ${w}`};
        }
      `}</style>
    </>
  )
}

Box.defaultProps = {
  ...theme.Box,
}

Box.propTypes = {
  bg: PropTypes.string,
  m: Dim,
  p: Dim,
  w: Dim,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export default Box
