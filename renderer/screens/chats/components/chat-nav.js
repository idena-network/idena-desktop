import React from 'react'
import {Box} from '../../../shared/components'
import theme from '../../../shared/theme'

export default function Nav(props) {
  return (
    <Box
      css={{borderRight: `solid 1px ${theme.colors.gray}`, minHeight: '100vh'}}
      p={theme.spacings.normal}
      {...props}
    />
  )
}
