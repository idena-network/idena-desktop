import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'
import {Dim} from './box'

export function Heading({
  color,
  fontSize,
  fontWeight,
  margin,
  children,
  ...props
}) {
  return (
    <h1 {...props}>
      {children}
      <style jsx>{`
        h1 {
          display: inline-block;
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          ${margin};
        }
      `}</style>
    </h1>
  )
}
Heading.defaultProps = {
  ...theme.Heading,
}
Heading.propTypes = {
  color: PropTypes.string,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.number,
  margin: Dim,
  children: PropTypes.node,
}

export function SubHeading({
  color,
  fontSize,
  fontWeight,
  margin,
  children,
  ...props
}) {
  return (
    <h2 {...props}>
      {children}
      <style jsx>{`
        h2 {
          display: inline-block;
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          ${margin};
        }
      `}</style>
    </h2>
  )
}

SubHeading.defaultProps = {
  ...theme.SubHeading,
}

SubHeading.propTypes = {
  color: PropTypes.string,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.number,
  margin: Dim,
  children: PropTypes.node,
}

export function Text({color, fontSize, fontWeight, css, ...props}) {
  return (
    <>
      <span {...props} style={css} />
      <style jsx>{`
        span {
          display: inline-block;
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
        }
      `}</style>
    </>
  )
}

Text.defaultProps = {
  ...theme.Text,
}

Text.propTypes = {
  color: PropTypes.string,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}
