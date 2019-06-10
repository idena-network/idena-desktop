import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '.'
import theme from '../theme'

function Divider({vertical}) {
  return vertical ? (
    <Box
      bg={theme.colors.gray2}
      css={{width: '1px', height: '100%', minHeight: theme.fontSizes.large}}
    />
  ) : (
    <Box bg={theme.colors.gray2} w="100%" css={{height: '1px'}} />
  )
}

Divider.propTypes = {
  vertical: PropTypes.bool,
}

export default Divider
