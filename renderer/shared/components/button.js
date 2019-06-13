import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'

function Button({size = 1, disabled, css, ...props}) {
  return (
    <>
      <button type="button" disabled={disabled} style={css} {...props} />
      <style jsx>{`
        button {
          background: ${theme.colors.primary};
          border: none;
          border-radius: 6px;
          color: ${theme.colors.white};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          font-size: ${`${size}em`};
          padding: ${`${0.5 * size}em ${size}em`};
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

Button.defaultProps = {
  ...theme.Button,
}

Button.propTypes = {
  size: PropTypes.number,
  disabled: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export function FlatButton({size = 1, color, disabled, css, ...props}) {
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

export default Button
