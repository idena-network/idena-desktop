/* eslint-disable import/prefer-default-export */
import React from 'react'
import {FiX} from 'react-icons/fi'
import theme from '../theme'

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
