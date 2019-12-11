import {useReducer, useCallback} from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'
import api from '../api/api-client'

/**
 * @typedef UseRpcResult
 * @param {string} method Method name
 * @param {string} params: Params
 * @param {string} id: Id
 * @param {string} result: Result
 * @param {string} error: Error, if thrown
 * @param {string} isLoading: Loading state
 * @param {string} isReady: Ready state
 */

/**
 * Call RPC with args
 * @param {string} initialMethod Method name
 * @param  {...any} initialParams Params passed as args
 * @returns {[UseRpcResult, *]} Result
 */
export default function useRpc(initialMethod, ...initialParams) {
  const [rpcBody, dispatchRpc] = useReducer(
    (state, [method, ...params]) => ({
      ...state,
      method,
      params,
      id: state.id + 1,
    }),
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
            error: action.error,
            isReady: true,
          }
        case 'fail':
          return {
            ...state,
            isLoading: false,
            error: action.error,
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
        const {data} = await api().post('/', rpcBody)
        if (!ignore) {
          dataDispatch({type: 'done', ...data})
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
    useCallback((method, ...params) => dispatchRpc([method, ...params]), []),
  ]
}
