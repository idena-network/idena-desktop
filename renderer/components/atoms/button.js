/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

export const Button = ({type = 'button', ...props}) => {
  return (
    <>
      {type === 'submit' ? (
        <input type="submit" {...props} />
      ) : (
        <button type="button" {...props} />
      )}
      <style jsx>{`
        button,
        input {
          background: ${theme.colors.primary};
          color: ${theme.colors.white};
          cursor: pointer;
          border: none;
          border-radius: 6px;
          font-size: 1em;
          padding: 0.5em 1em;
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
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
}
