import React from 'react'
import PropTypes from 'prop-types'
import {FiClock} from 'react-icons/fi'
import {rem} from 'polished'
import Flex from '../../../shared/components/flex'
import {Text} from '../../../shared/components'
import theme from '../../../shared/theme'
import {useValidationTimer} from '../../../shared/hooks/use-validation'
import {SessionType} from '../../../shared/providers/validation-context'

const padded = t => t.toString().padStart(2, 0)

function formatSeconds(seconds) {
  return [Math.floor(seconds / 60), seconds % 60].map(padded).join(':')
}

function Timer({type, color = theme.colors.danger, useIcon = true}) {
  const seconds = useValidationTimer(type)
  return (
    <Flex align="center">
      {useIcon && <FiClock color={color} style={{marginRight: rem(4)}} />}
      <Text color={color} fontWeight={600}>
        {formatSeconds(seconds)}
      </Text>
    </Flex>
  )
}

Timer.propTypes = {
  type: PropTypes.oneOf(Object.values(SessionType)),
  color: PropTypes.string,
  useIcon: PropTypes.bool,
}

export default Timer
