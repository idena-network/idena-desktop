import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'

export const Dim = PropTypes.oneOfType([PropTypes.string, PropTypes.number])

function Box({bg, m, margin, p, padding, w, css: style, ...props}) {
  const marginProp = m || margin
  const paddingProp = p || padding
  return (
    <>
      <div style={style} {...props} />
      <style jsx>{`
        div {
          background: ${bg};
          display: block;
          ${marginProp && `margin: ${marginProp}`};
          ${paddingProp && `padding: ${paddingProp}`};
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
  margin: Dim,
  padding: Dim,
  w: Dim,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export default Box
