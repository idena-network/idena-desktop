import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem, padding} from 'polished'
import {Heading, Box} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'
import {
  useValidationState,
  SessionType,
} from '../../../shared/providers/validation-context'

function ValidationHeader({type, currentIndex, total, children}) {
  const isShort = type.toLowerCase() === 'short'
  const {stage} = useValidationState()
  return (
    <Flex justify="space-between" align="center" css={margin(0, 0, rem(44))}>
      <Box>
        <Heading
          color={isShort ? theme.colors.white : theme.colors.text}
          style={{...margin(0), ...padding(rem(9), 0, rem(7))}}
        >
          {stage === SessionType.Qualification
            ? 'Check flips quality'
            : 'Select meaningful story: left or right'}{' '}
          {total ? `(${currentIndex + 1} of ${total})` : null}
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
