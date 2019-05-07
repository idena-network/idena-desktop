import React, {useState} from 'react'
import {Box} from '../../../../../shared/components'
import {useInterval} from '../../../shared/utils/useInterval'

function Timer() {
  const [time, setTime] = useState(5 * 60 * 1000)

  useInterval(() => {
    setTime(time - 1000)
  }, 1000)

  return (
    <Box>
      {new Date(time).getMinutes()}:{new Date(time).getSeconds()} left
    </Box>
  )
}

Timer.propTypes = {}

export default Timer
