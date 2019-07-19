import React, {forwardRef} from 'react'
import PropTypes from 'prop-types'
import {Box} from '.'
import {Dim} from './box'

export const Absolute = forwardRef(
  ({bg, top, left, bottom, right, zIndex, width, css, ...props}, ref) => (
    <Box
      css={{
        ...css,
        background: bg,
        position: 'absolute',
        left,
        right,
        top,
        bottom,
        zIndex,
        width,
      }}
      ref={ref}
      {...props}
    />
  )
)

Absolute.propTypes = {
  bg: PropTypes.string,
  top: Dim,
  left: Dim,
  bottom: Dim,
  right: Dim,
  width: Dim,
  zIndex: PropTypes.number,
  children: PropTypes.node,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export function Fill(props) {
  return (
    <Absolute top={0} left={0} bottom={0} right={0} zIndex={1} {...props} />
  )
}

Fill.propTypes = {
  bg: PropTypes.string,
  zIndex: PropTypes.number,
}
