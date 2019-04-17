/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '.'
import {Dim} from './box'

export function Absolute({
  bg,
  top,
  left,
  bottom,
  right,
  zIndex,
  children,
  ...boxProps
}) {
  return (
    <div>
      <Box {...boxProps}>{children}</Box>
      <style jsx>{`
        div {
          background: ${bg};
          position: absolute;
          left: ${left};
          right: ${right};
          top: ${top};
          bottom: ${bottom};
          z-index: ${zIndex};
          width: ${boxProps.w};
        }
      `}</style>
    </div>
  )
}

Absolute.propTypes = {
  bg: PropTypes.string,
  top: Dim,
  left: Dim,
  bottom: Dim,
  right: Dim,
  zIndex: PropTypes.number,
  children: PropTypes.node,
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
