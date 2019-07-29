import {useReducer, useCallback, useRef} from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

export default function useRpc(method, ...params) {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'start':
          return {
            ...state,
            isLoading: true,
            isReady: false,
          }
        case 'done':
          return {
            ...state,
            isLoading: false,
            ...action,
            isReady: true,
          }
        case 'fail':
          return {
            ...state,
            isLoading: false,
            error: action.error.message,
            isReady: true,
          }
        default:
          return state
      }
    },
    {
      result: null,
      error: null,
      isLoading: false,
      isReady: false,
    }
  )

  const ignore = useRef()

  const fetchData = useCallback(async () => {
    try {
      const resp = await fetch('http://localhost:9009', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          params,
          id: 1,
        }),
      })
      const json = await resp.json()
      if (!ignore.current) {
        dispatch({type: 'done', ...json})
      }
    } catch (error) {
      if (!ignore.current) {
        dispatch({type: 'error', error})
      }
    }
  }, [method, params])

  useDeepCompareEffect(() => {
    if (!method) {
      return null
    }

    ignore.current = false

    dispatch({type: 'start'})
    fetchData(ignore)

    return () => {
      ignore.current = true
    }
  }, [dispatch, method, params])

  return [state, fetchData]
}
