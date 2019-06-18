/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import theme from '../theme'

export function AddIcon({width = '32px', ...props}) {
  return (
    <i {...props}>
      <span>+</span>
      <style jsx>{`
        i {
          background: ${theme.colors.primary};
          border-radius: 10px;
          color: ${theme.colors.white};
          display: inline-block;
          font-style: normal;
          text-align: center;
          height: 24px;
          width: ${width};
        }
        i::before {
          content: '';
          display: inline-block;
          height: 100%;
          vertical-align: middle;
        }
        span {
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>
    </i>
  )
}

AddIcon.propTypes = {
  width: PropTypes.string,
}

export function IconClose(props) {
  return (
    <FiX
      color={theme.colors.muted}
      fontSize={theme.fontSizes.large}
      cursor="pointer"
      {...props}
    />
  )
}
