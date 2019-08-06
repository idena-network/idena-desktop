import {useReducer} from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

export default function useRpc(initialMethod, ...initialParams) {
  const [rpcBody, dispatchRpc] = useReducer(
    (state, [method, ...params]) => {
      return {
        ...state,
        method,
        params,
        id: state.id + 1,
      }
    },
    {
      method: initialMethod,
      params: initialParams,
      id: 0,
    }
  )

  const [dataState, dataDispatch] = useReducer(
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
            result: action.result,
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

  useDeepCompareEffect(() => {
    let ignore = false

    async function fetchData() {
      try {
        const resp = await fetch('http://localhost:9009', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rpcBody),
        })
        const json = await resp.json()
        if (!ignore) {
          dataDispatch({type: 'done', ...json})
        }
      } catch (error) {
        if (!ignore) {
          dataDispatch({type: 'fail', error})
        }
      }
    }

    if (rpcBody.method) {
      fetchData()
    }

    return () => {
      ignore = true
    }
  }, [rpcBody])

  return [
    {...dataState, ...rpcBody},
    (method, ...params) => dispatchRpc([method, ...params]),
  ]
}
