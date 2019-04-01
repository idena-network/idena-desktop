/* eslint-disable react/button-has-type */
/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

export const Button = ({type = 'button', size = '1em', ...props}) => {
  return (
    <>
      <button type={type} {...props} />
      <style jsx>{`
        button,
        input {
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
          cursor: pointer;
          border: none;
          border-radius: 6px;
          font-size: ${size};
          padding: ${`${0.5 * size}em ${size}em`};
          outline: none;
        }
        button:hover,
        input:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  )
}

Button.propTypes = {
  primary: PropTypes.bool,
  size: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
}
