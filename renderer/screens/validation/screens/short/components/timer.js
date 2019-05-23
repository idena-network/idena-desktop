import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '../../../../../shared/components'
import {useInterval} from '../../../shared/utils/useInterval'

function Timer({time, onTick}) {
  useInterval(
    () => {
      if (time > 0) {
        onTick(time - 1)
      }
    },
    time > 0 ? 1000 : null
  )

  const mins = Math.floor(time / 60)
  const secs = time - mins * 60

  return (
    <Box>{`${mins}:${secs.toLocaleString(undefined, {
      minimumIntegerDigits: 2,
    })} left`}</Box>
  )
}

Timer.propTypes = {
  time: PropTypes.number.isRequired,
  onTick: PropTypes.func.isRequired,
}

export default Timer
