import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Heading, Box} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

function ValidationHeader({type, currentIndex, total, children}) {
  const isShort = type.toLowerCase() === 'short'
  return (
    <Flex
      justify="space-between"
      align="center"
      css={{
        ...margin(0, 0, rem(40)),
        minHeight: rem(80),
      }}
    >
      <Box>
        <Heading color={isShort ? theme.colors.white : theme.colors.text}>
          Select meaningful story: left or right ({currentIndex} of {total})
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
