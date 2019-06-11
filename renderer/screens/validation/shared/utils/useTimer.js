import {useState, useEffect} from 'react'
import {useInterval} from './useInterval'

function useTimer({seconds: initialSeconds}) {
  const [seconds, setSeconds] = useState(initialSeconds)

  const shouldRun = seconds > 0

  useInterval(
    () => setSeconds(prevSeconds => prevSeconds - 1),
    shouldRun ? 1 * 1000 : null
  )

  useEffect(() => {
    setSeconds(0)
    setSeconds(initialSeconds)
  }, [initialSeconds])

  return {seconds}
}

export default useTimer
