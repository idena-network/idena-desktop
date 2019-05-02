import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'

function Button({size = 1, css, ...props}) {
  return (
    <>
      <button type="button" style={css} {...props} />
      <style jsx>{`
        button {
          background: ${theme.colors.primary};
          border: none;
          border-radius: 6px;
          color: ${theme.colors.white};
          cursor: pointer;
          font-size: ${`${size}em`};
          padding: ${`${0.5 * size}em ${size}em`};
          outline: none;
        }
        button:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  )
}

Button.propTypes = {
  size: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  css: PropTypes.object,
}

export default Button
