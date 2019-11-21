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

// TODO: move to usePoll later, yay
export function useInterval(callback, delay, useImmediately = false) {
  const savedCallback = useRef()
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    let timeoutId

    async function tick() {
      await savedCallback.current()
    }

    async function pollTick() {
      clearTimeout(timeoutId)
      await tick()
      timeoutId = setTimeout(pollTick, delay)
    }

    if (delay !== null) {
      if (useImmediately) {
        tick()
      }
      pollTick()
      return () => clearTimeout(timeoutId)
    }
  }, [delay, useImmediately])
}

export function usePoll([{method, params, ...rest}, callRpc], delay) {
  useInterval(() => callRpc(method, ...params), delay)
  return [{method, params, ...rest}, callRpc]
}

export function usePolling(fetcher, delay) {
  useEffect(() => {
    let timeoutId

    async function poll() {
      await fetcher()
      timeoutId = setTimeout(poll, delay)
    }

    poll()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [delay, fetcher])
}
