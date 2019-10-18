import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import {FiClock} from 'react-icons/fi'
import {rem} from 'polished'
import Flex from '../../../shared/components/flex'
import {Text} from '../../../shared/components'
import theme from '../../../shared/theme'
import {useValidationTimer} from '../../../shared/hooks/use-validation'
import {SessionType} from '../../../shared/providers/validation-context'
import {
  useEpochState,
  EpochPeriod,
} from '../../../shared/providers/epoch-context'
import {useTimingState} from '../../../shared/providers/timing-context'

const padded = t => t.toString().padStart(2, 0)

function formatSeconds(seconds) {
  return [Math.floor(seconds / 60), seconds % 60].map(padded).join(':')
}

function Timer({type, color = theme.colors.danger, useIcon = true}) {
  const epoch = useEpochState()
  // const {longSession} = useTimingState()
  const {
    secondsLeftForShortSession: shortSeconds,
    secondsLeftForLongSession: longSeconds,
  } = useValidationTimer()

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
        />
      )}
      <Text color={color} fontWeight={600}>
        {type === SessionType.Short &&
          Number.isFinite(shortSeconds) &&
          formatSeconds(shortSeconds)}
        {type === SessionType.Long &&
          Number.isFinite(longSeconds) &&
          formatSeconds(longSeconds)}
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
