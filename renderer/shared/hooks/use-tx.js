import {useReducer} from 'react'
import useRpc from './use-rpc'
import {HASH_IN_MEMPOOL} from '../utils/tx'
import {useInterval} from './use-interval'

/**
 * @typedef {Object} Tx
 * @property {string} type
 * @property {string} from
 * @property {string} to
 * @property {string} amount
 * @property {string} nonce
 * @property {string} epoch
 * @property {string} payload
 * @property {string} blockHash
 */

/**
 * @typedef {Object} TxStatus
 * @property {boolean} mining
 * @property {boolean} mined
 */

/**
 * useTx
 * @param {string} hash
 * @returns {Tx & TxStatus} tx
 */
export default function useTx(hash) {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'mempool':
          return {
            ...state,
            mining: true,
            mined: false,
            ...action.result,
          }
        case 'mined':
          return {
            ...state,
            mining: false,
            mined: true,
            ...action.result,
          }
        case 'fail':
          return {
            ...state,
            mining: false,
            mined: true,
            error: action.error.message,
          }
        case 'missing':
          return {
            ...state,
            mining: false,
            mined: true,
            error: 'tx is missing /shrug',
          }
        default:
          throw new Error(`Unknown action ${action.type}`)
      }
    },
    {
      mining: false,
      mined: false,
    }
  )

  const [{result, error, isReady}, fetchTx] = useRpc('bcn_transaction', hash)

  useInterval(
    () => {
      if (error) {
        dispatch({type: 'fail', error})
      } else if (isReady && result === null) {
        dispatch({type: 'missing'})
      } else {
        const {blockHash} = result
        if (blockHash === HASH_IN_MEMPOOL) {
          dispatch({
            type: 'mempool',
            result,
          })
          fetchTx('bcn_transaction', hash)
        } else {
          dispatch({
            type: 'mined',
            result,
          })
        }
      }
    },
    hash && !state.mined ? 1000 : null
  )

  return state
}
