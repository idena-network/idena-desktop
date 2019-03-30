import React from 'react'
import PropTypes from 'prop-types'

// eslint-disable-next-line react/prop-types
export const Heading = ({children, ...props}) => (
  <h1 {...props}>
    <style jsx>{`
      h1 {
        color: rgb(83, 86, 92);
        font-size: 1.7em;
        margin: 0 0 2em;
      }
    `}</style>
  </h1>
)

// eslint-disable-next-line react/prop-types
export const SubHeading = ({children, ...props}) => (
  <h2 {...props}>
    {children}
    <style jsx>{`
      h2 {
        color: rgb(83, 86, 92);
        font-size: 1.2em;
        margin: 0 0 0.5em;
      }
    `}</style>
  </h2>
)

export const Text = ({
  color,
  bold,
  padded,
  wrap,
  small,
  children,
  ...props
}) => (
  <span {...props}>
    {children}
    <style jsx>{`
      span {
        display: inline-block;
        ${color && `color: ${color}`};
        ${bold && 'font-weight: bold'};
        ${padded &&
          `padding: 0.5em 1em;
        margin: 0 0 0.5em;`};
        ${wrap && `word-break: break-all;`};
        ${small && `font-size: 0.8em;`}
      }
    `}</style>
  </span>
)

Text.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  bold: PropTypes.bool,
  padded: PropTypes.bool,
  wrap: PropTypes.bool,
  small: PropTypes.bool,
}
