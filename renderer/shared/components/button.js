import React from 'react'
import PropTypes from 'prop-types'
import {transparentize, darken} from 'polished'
import theme, {rem} from '../theme'

function Button({size, disabled, danger, variant = 'primary', css, ...props}) {
  const isPrimary = variant === 'primary'
  const bgColor = danger ? theme.colors.danger : theme.colors.primary

  const bg = isPrimary ? bgColor : transparentize(0.88, bgColor)
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
          cursor: pointer;
          font-size: ${rem(size)};
          padding: ${rem(6)} ${rem(16)};
          outline: none;
          transition: all 0.3s ease;
          transition-property: background, color;
          min-height: ${rem(32)};
        }
        button:hover {
          background: ${darken(0.1, bg)};
          color: ${darken(0.05, color)};
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </>
  )
}
Button.defaultProps = {
  ...theme.Button,
}
Button.propTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  danger: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

function FlatButton({size, color, disabled, css, ...props}) {
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
          font-size: ${rem(size)};
          padding: 0;
          outline: none;
          ${disabled && `opacity: 0.5`};
          transition: background 0.3s ease, color 0.3s ease;
        }
        button:hover {
          color: ${darken(0.05, color)};
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

// eslint-disable-next-line react/prop-types
function IconButton({icon, children, disabled, danger, ...props}, ref) {
  const color = danger ? theme.colors.danger : theme.colors.primary
  return (
    <button type="button" disabled={disabled} ref={ref} {...props}>
      {icon}
      <span>{children}</span>
      <style jsx>{`
        button {
          background: none;
          border: none;
          cursor: ${disabled ? 'default' : 'pointer'};
          font-size: 1em;
          display: flex;
          align-items: center;
          text-decoration: none;
          vertical-align: middle;
          position: relative;
          transition: color 0.5s ease;
          ${disabled && `opacity: 0.5`};
        }
        span {
          display: inline-block;
        }
      `}</style>
      <style jsx>{`
        button {
          color: ${color};
          font-weight: 500;
          padding: ${rem(theme.spacings.small8)};
        }
        button:hover {
          color: ${darken(0.1, color)};
        }
        span {
          margin-left: ${theme.spacings.small};
        }
      `}</style>
    </button>
  )
}

const IconButtonRef = React.forwardRef(IconButton)

IconButtonRef.propTypes = {
  icon: PropTypes.node,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  danger: PropTypes.bool,
}

export {FlatButton, IconButtonRef as IconButton}
export default Button
