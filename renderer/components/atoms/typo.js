import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

// eslint-disable-next-line react/prop-types
export const Heading = ({children, ...props}) => (
  <h1 {...props}>
    {children}
    <style jsx>{`
      h1 {
        color: ${theme.colors.primary2};
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
        color: ${theme.colors.primary2};
        font-size: 1.2em;
        margin: 0 0 0.5em;
      }
    `}</style>
  </h2>
)

export const Text = ({
  color,
  size = '1em',
  weight = 'normal',
  style,
  ...props
}) => (
  <>
    <span {...props} style={style} />
    <style jsx>{`
      span {
        display: inline-block;
        color: ${color};
        font-size: ${size};
        font-weight: ${weight};
      }
    `}</style>
  </>
)

Text.propTypes = {
  color: PropTypes.string,
  size: PropTypes.string,
  weight: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
}
