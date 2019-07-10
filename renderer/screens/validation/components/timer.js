import React from 'react'
import {FiClock} from 'react-icons/fi'
import {rem} from 'polished'
import dayjs from 'dayjs'
import {useInterval} from '../../../shared/hooks/use-interval'
import Flex from '../../../shared/components/flex'
import {Text} from '../../../shared/components'
import theme from '../../../shared/theme'
import {useTimingState} from '../../../shared/providers/timing-context'
import {
  useEpochState,
  EpochPeriod,
} from '../../../shared/providers/epoch-context'

function convertToMinSec(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return {
    min,
    sec,
  }
}

const padded = t => t.toString().padStart(2, 0)

// eslint-disable-next-line react/prop-types
function Timer({type}) {
  const [seconds, setSeconds] = React.useState(null)

  const {shortSession, longSession} = useTimingState()
  const epoch = useEpochState()

  React.useEffect(() => {
    if (epoch) {
      const {currentValidationStart, nextValidation, currentPeriod} = epoch
      const validationStart = dayjs(currentValidationStart || nextValidation)

      if (currentPeriod === EpochPeriod.ShortSession) {
        const finish = validationStart.add(shortSession, 's')
        setSeconds(finish.diff(dayjs(), 's'))
      }
      if (type === 'long' || currentPeriod === EpochPeriod.LongSession) {
        const finish = validationStart.add(longSession, 's')
        setSeconds(finish.diff(dayjs(), 's'))
      }
    }
  }, [epoch, shortSession, longSession, type])

  useInterval(() => setSeconds(seconds - 1), seconds > 0 ? 1000 : null)

  const {min, sec} = convertToMinSec(seconds)
  return (
    <Flex align="center">
      <FiClock color={theme.colors.danger} style={{marginRight: rem(4)}} />
      <Text color={theme.colors.danger} fontWeight={600}>
        {`${padded(min)}:${padded(sec)}`}
      </Text>
    </Flex>
  )
}

export default Timer
