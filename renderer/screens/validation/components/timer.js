import React from 'react'
import PropTypes from 'prop-types'
import {FiClock} from 'react-icons/fi'
import {rem} from 'polished'
import Flex from '../../../shared/components/flex'
import {Text, Box} from '../../../shared/components'
import theme from '../../../shared/theme'
import {useValidationTimer} from '../../../shared/hooks/use-validation-timer'
import {
  SessionType,
  useValidationState,
} from '../../../shared/providers/validation-context'
import {useEpochState} from '../../../shared/providers/epoch-context'

export const GAP = 10

function formatSeconds(seconds) {
  return [Math.floor(seconds / 60), seconds % 60]
    .map(t => t.toString().padStart(2, 0))
    .join(':')
}

function Timer({type, color = theme.colors.danger, useIcon = true}) {
  const epoch = useEpochState()
  const {
    secondsLeftForShortSession: shortSeconds,
    secondsLeftForLongSession: longSeconds,
  } = useValidationTimer()
  const {shortAnswersSubmitted} = useValidationState()

  if (!epoch) {
    return null
  }

  return (
    <Flex align="center">
      {useIcon && (
        <FiClock
          size={rem(20)}
          color={color}
          style={{marginRight: rem(theme.spacings.small8)}}
          width={rem(20)}
        />
      )}
      <Box
        w={rem(37, theme.fontSizes.base)}
        style={{fontVariantNumeric: 'tabular-nums'}}
      >
        <Countdown
          color={color}
          fontWeight={600}
          seconds={
            type === SessionType.Short && !shortAnswersSubmitted
              ? shortSeconds
              : longSeconds
          }
        />
      </Box>
    </Flex>
  )
}

// eslint-disable-next-line react/prop-types
export function Countdown({seconds, ...props}) {
  return (
    <Text css={{fontVariantNumeric: 'tabular-nums'}} {...props}>
      {formatSeconds(seconds)}
    </Text>
  )
}

Timer.propTypes = {
  type: PropTypes.oneOf(Object.values(SessionType)),
  color: PropTypes.string,
  useIcon: PropTypes.bool,
}

export default Timer
