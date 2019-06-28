import React from 'react'
import PropTypes from 'prop-types'
import {rem, transparentize, transitions, darken, lighten} from 'polished'
import theme from '../theme'

function Button({size = 1, disabled, variant = 'primary', css, ...props}) {
  const isPrimary = variant === 'primary'
  const bg = isPrimary
    ? theme.colors.primary
    : transparentize(0.88, theme.colors.primary)
  const color = isPrimary ? theme.colors.white : theme.colors.primary

  return (
    <>
      <button type="button" disabled={disabled} style={css} {...props} />
      <style jsx>{`
        button {
          background: ${bg};
          border: none;
          border-radius: 6px;
          color: ${color};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          font-size: ${`${size}em`};
          padding: ${`${0.5 * size}em ${size}em`};
          outline: none;
          ${disabled && `opacity: 0.5`};
          transition: background 0.3s ease, color 0.3s ease;
        }
        button:hover {
          background: ${darken(0.1, bg)};
          color: ${darken(0.05, color)};
          ${disabled && `opacity: 0.5`};
        }
      `}</style>
    </>
  )
}
Button.defaultProps = {
  ...theme.Button,
}
Button.propTypes = {
  size: PropTypes.number,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

function FlatButton({size = 1, color, disabled, css, ...props}) {
  return (
    <>
      <button type="button" disabled={disabled} style={css} {...props} />
      <style jsx>{`
        button {
          background: none;
          border: none;
          border-radius: 6px;
          color: ${color};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          font-size: ${`${size}em`};
          padding: 0;
          outline: none;
          ${disabled && `opacity: 0.5`};
        }
        button:hover {
          opacity: 0.9;
          ${disabled && `opacity: 0.5`};
        }
      `}</style>
    </>
  )
}
FlatButton.defaultProps = {
  ...theme.Button,
}
FlatButton.propTypes = Button.propTypes

function IconButton({icon, children, ...props}) {
  return (
    <button type="button" {...props}>
      {icon}
      <span>{children}</span>
      <style jsx>{`
        button {
          background: none;
          border: none;
          color: ${theme.colors.primary};
          cursor: pointer;
          font-size: 1em;
          display: flex;
          align-items: center;
          padding: ${rem(theme.spacings.small8)};
          text-decoration: none;
          vertical-align: middle;
          position: relative;
          transition: all 0.5s ease-out;
        }
        span {
          display: inline-block;
          margin-left: ${theme.spacings.small};
        }
      `}</style>
    </button>
  )
}
IconButton.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
}

export {FlatButton, IconButton}
export default Button
