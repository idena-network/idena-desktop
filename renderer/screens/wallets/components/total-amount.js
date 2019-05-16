import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {Box, Text} from '../../../shared/components'
import theme from '../../../shared/theme'

function TotalAmount({amount}) {
  return (
    <Box>
      <Box>
        <Text color={theme.colors.muted}>Total amount</Text>
      </Box>
      <Box>
        <Text fontSize={rem(theme.fontSizes.large)}>{amount} DNA</Text>
      </Box>
    </Box>
  )
}

TotalAmount.propTypes = {
  amount: PropTypes.number.isRequired,
}

export default TotalAmount
