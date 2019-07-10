import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem, padding} from 'polished'
import {Heading, Box} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

function ValidationHeader({type, currentIndex, total, children}) {
  const isShort = type.toLowerCase() === 'short'
  return (
    <Flex justify="space-between" align="center" css={margin(0, 0, rem(44))}>
      <Box>
        <Heading
          color={isShort ? theme.colors.white : theme.colors.text}
          style={{...margin(0), ...padding(rem(9), 0, rem(7))}}
        >
          Select meaningful story: left or right ({currentIndex + 1} of {total})
        </Heading>
      </Box>
      <Box>{children}</Box>
    </Flex>
  )
}

ValidationHeader.propTypes = {
  type: PropTypes.string.isRequired,
  currentIndex: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  children: PropTypes.node,
}

export default ValidationHeader
