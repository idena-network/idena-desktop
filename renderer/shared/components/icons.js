/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

export function AddIcon({width = '24px'}) {
  return (
    <div>
      +
      <style jsx>{`
        div {
          background: ${theme.colors.primary};
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: ${width};
        }
      `}</style>
    </div>
  )
}

AddIcon.propTypes = {
  width: PropTypes.string,
}
