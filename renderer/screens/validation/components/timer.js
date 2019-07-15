import React from 'react'
import {FiClock} from 'react-icons/fi'
import {rem} from 'polished'
import Flex from '../../../shared/components/flex'
import {Text} from '../../../shared/components'
import theme from '../../../shared/theme'
import {useValidationTimer} from '../../../shared/hooks/use-validation'

const padded = t => t.toString().padStart(2, 0)

function mapToMinSec(seconds) {
  return [Math.floor(seconds / 60), seconds % 60]
}

function Timer() {
  const seconds = useValidationTimer()
  return (
    <Flex align="center">
      <FiClock color={theme.colors.danger} style={{marginRight: rem(4)}} />
      <Text color={theme.colors.danger} fontWeight={600}>
        {mapToMinSec(seconds)
          .map(padded)
          .join(':')}
      </Text>
    </Flex>
  )
}

export default Timer
