import React from 'react'
import PropTypes from 'prop-types'
import {FiClock} from 'react-icons/fi'
import {rem} from 'polished'
import {useInterval} from '../../../shared/utils/useInterval'
import Flex from '../../../../../shared/components/flex'
import {Text} from '../../../../../shared/components'
import theme from '../../../../../shared/theme'

function convertSeconds(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return {
    min,
    sec,
  }
}

function Timer({seconds: initialSeconds}) {
  const [seconds, setSeconds] = React.useState(initialSeconds)
  useInterval(
    () => {
      setSeconds(seconds - 1)
    },
    seconds > 0 ? 1000 : null
  )
  let {min, sec} = convertSeconds(seconds)
  min = min.toString().padStart(2, 0)
  sec = sec.toString().padStart(2, 0)
  return (
    <Flex align="center">
      <FiClock color={theme.colors.danger} style={{marginRight: rem(4)}} />
      <Text color={theme.colors.danger} fontWeight={600}>
        {`${min}:${sec}`}
      </Text>
    </Flex>
  )
}

Timer.propTypes = {
  seconds: PropTypes.number.isRequired,
}

export default Timer
