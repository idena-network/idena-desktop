import {useState, useEffect} from 'react'
import {useInterval} from './useInterval'

function useTimer({seconds}) {
  const [secondsLeft, setSecondsLeft] = useState(seconds)

  const shouldRun = secondsLeft > 0

  useInterval(
    () => setSecondsLeft(secondsLeft - 1),
    shouldRun ? 1 * 1000 : null
  )

  useEffect(() => {
    setSecondsLeft(0)
    setSecondsLeft(seconds)
  }, [seconds])

  return {secondsLeft}
}

export default useTimer
