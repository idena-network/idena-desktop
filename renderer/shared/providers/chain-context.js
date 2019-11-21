import React, {useEffect} from 'react'
import {useInterval} from '../hooks/use-interval'
import {fetchSync} from '../api'
import {useSettingsState} from './settings-context'

const FETCH_SYNC_SUCCEEDED = 'FETCH_SYNC_SUCCEEDED'
const FETCH_SYNC_FAILED = 'FETCH_SYNC_FAILED'
const SET_LOADING = 'SET_LOADING'

const initialState = {
  loading: true,
  offline: true,
  syncing: false,
  currentBlock: null,
  highestBlock: null,
  progress: null,
}

function chainReducer(state, action) {
  switch (action.type) {
    case SET_LOADING: {
      return {
        ...state,
        loading: true,
      }
    }
    case FETCH_SYNC_SUCCEEDED: {
      return {
        ...state,
        ...action.payload,
        offline: false,
        loading: false,
      }
    }
    case RESOLVE: {
      return {
        ...state,
        syncing: false,
        offline: true,
        loading: false,
      }
    default:
      throw new Error(`Unknown action ${type}`)
  }
}

const initialState = {
  status: Status.Idle,
  syncing: true,
  currentBlock: null,
  highestBlock: null,
}

// eslint-disable-next-line react/prop-types
function ChainProvider({children}) {
  const {useExternalNode} = useSettingsState()
  const [state, dispatch] = React.useReducer(chainReducer, initialState)

  useEffect(() => {
    dispatch({type: SET_LOADING})
  }, [useExternalNode])

  useInterval(
    async () => {
      try {
        const sync = await fetchSync()
        dispatch({type: FETCH_SYNC_SUCCEEDED, payload: sync})
      } catch (error) {
        dispatch({type: FETCH_SYNC_FAILED})
      }
    },
    !state.offline && state.syncing ? 1000 * 1 : 1000 * 5,
    true
  )

  return (
    <ChainStateContext.Provider value={state}>
      {children}
    </ChainStateContext.Provider>
  )
}

export function useChainState() {
  const context = React.useContext(ChainStateContext)
  if (context === undefined) {
    throw new Error('useChainState must be used within a ChainProvider')
  }
  return context
}

export function useChain() {
  return [useChainState()]
}

// eslint-disable-next-line no-shadow
export async function callRpc(method, ...params) {
  const {result, error} = await (await fetch('//localhost:5555', {
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
  })).json()

  if (error) throw new Error(error.message)

  return result
}
