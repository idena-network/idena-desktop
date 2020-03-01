import {useState, useReducer, useEffect} from 'react'
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
 * @param {string} initialHash
 * @returns {[Tx & TxStatus, *]} tx
 */
export default function useTx(initialHash) {
  const [hash, setHash] = useState(initialHash)
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'reset':
          return {
            ...prevState,
            mining: true,
            mined: false,
          }
        case 'mempool':
          return {
            ...prevState,
            mining: true,
            mined: false,
            ...action.result,
          }
        case 'mined':
          return {
            ...prevState,
            mining: false,
            mined: true,
            ...action.result,
          }
        case 'fail':
          return {
            ...prevState,
            mining: false,
            mined: true,
            error: action.error.message,
          }
        case 'missing':
          return {
            ...prevState,
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

  const [{result, error}, fetchTx] = useRpc('bcn_transaction', initialHash)

  useEffect(() => {
    dispatch({type: 'reset'})
    fetchTx('bcn_transaction', hash)
  }, [fetchTx, hash])

  useInterval(
    () => {
      if (error) {
        dispatch({type: 'fail', error})
      }
      if (result === null) {
        dispatch({type: 'missing'})
      }
      if (result !== null) {
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
    hash && !state.mined ? 1000 * 10 : null
  )

  return [state, setHash]
}
