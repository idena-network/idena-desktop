import React from 'react'
import PropTypes from 'prop-types'
import {useColorMode} from '@chakra-ui/core'
import {Box} from '.'
import theme from '../theme'

function Divider({vertical, m = 0}) {
  const {colorMode} = useColorMode()
  return vertical ? (
    <Box
      bg={theme.colors[colorMode].gray2}
      mx={m}
      css={{width: '1px', height: '100%', minHeight: theme.fontSizes.large}}
    />
  ) : (
    <Box
      bg={theme.colors[colorMode].gray2}
      my={m}
      w="100%"
      css={{height: '1px'}}
    />
  )
}

Divider.propTypes = {
  vertical: PropTypes.bool,
  m: PropTypes.string,
}

export default Divider
