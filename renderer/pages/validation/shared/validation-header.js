import React from 'react'
import PropTypes from 'prop-types'
import {Heading, Box} from '../../../shared/components'
import Flex from '../../../shared/components/flex'

function ValidationHeader({currentIndex, total, children}) {
  return (
    <Flex justify="space-between" align="center" css={{minHeight: '80px'}}>
      <Box>
        <Heading>{`Select a meaningful story: left or right (${currentIndex} of ${total})`}</Heading>
      </Box>
      <Box>{children}</Box>
    </Flex>
  )
}

ValidationHeader.propTypes = {
  currentIndex: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  children: PropTypes.node,
}

export default ValidationHeader
