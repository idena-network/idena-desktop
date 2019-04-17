import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

function Button({size = 1, ...props}) {
  return (
    <>
      <button type="button" {...props} />
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
  size: PropTypes.string,
}

export default Button
