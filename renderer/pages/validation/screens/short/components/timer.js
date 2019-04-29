import React, {useEffect, useState, useRef} from 'react'
import {Box} from '../../../../../shared/components'

function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

function Timer() {
  const [time, setTime] = useState(60 * 1000)

  useInterval(() => {
    setTime(time - 1000)
  }, 1000)

  return <Box>{new Date(time).toLocaleTimeString()}</Box>
}

Timer.propTypes = {}

export default Timer
