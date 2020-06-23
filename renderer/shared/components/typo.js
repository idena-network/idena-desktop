import React from 'react'
import PropTypes from 'prop-types'
import theme, {rem} from '../theme'
import {Dim} from './box'

export function Heading({
  color,
  fontSize,
  fontWeight,
  margin = 0,
  style,
  children,
}) {
  return (
    <h1 style={style}>
      {children}
      <style jsx>{`
        h1 {
          display: inline-block;
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          margin: ${margin};
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
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  children: PropTypes.node,
}

export function SubHeading({
  color,
  fontSize,
  fontWeight,
  margin,
  css,
  children,
}) {
  return (
    <h2 style={css}>
      {children}
      <style jsx>{`
        h2 {
          display: inline-block;
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          ${margin};
          margin: 0.25em 0;
          width: 100%;
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
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
  children: PropTypes.node,
}

export function Text({color, fontSize, fontWeight, lineHeight, css, ...props}) {
  return (
    <>
      <span {...props} style={css} />
      <style jsx>{`
        span {
          display: inline-block;
          color: ${color};
          font-size: ${fontSize};
          font-weight: ${fontWeight};
          line-height: ${lineHeight};
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
  lineHeight: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

// eslint-disable-next-line react/prop-types
export function BlockText({css, ...props}) {
  return <Text {...props} css={{...css, display: 'block'}} />
}

export function PageTitle(props) {
  return <Heading margin={`${rem(24)} 0 ${rem(24)}`} {...props} />
}
