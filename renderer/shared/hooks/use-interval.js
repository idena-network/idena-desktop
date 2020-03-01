import {useEffect, useRef} from 'react'

// TODO: just to make it clear that this useInterval uses interval. Yep!
export function useIntervalInterval(callback, delay, useImmediately = false) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      if (useImmediately) {
        tick()
      }
      const id = setTimeout(tick, delay)
      return () => clearTimeout(id)
    }
  }, [delay, useImmediately])
}

export function useInterval(callback, delay, useImmediately = false) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    let timeoutId

    function tick() {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        savedCallback.current()
        tick()
      }, delay)
    }

    if (delay !== null) {
      if (useImmediately) savedCallback.current()
      tick()
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [delay, useImmediately])
}

export function usePoll([{method, params, ...rest}, callRpc], delay) {
  useInterval(() => callRpc(method, ...params), delay)
  return [{method, params, ...rest}, callRpc]
}
