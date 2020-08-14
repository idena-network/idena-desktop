import React, {useEffect} from 'react'
import {useInterval} from '../hooks/use-interval'
import {fetchSync} from '../api'
import {useSettingsState} from './settings-context'
import {useAppMachine} from './app-context'

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
    case FETCH_SYNC_FAILED:
      return {
        ...state,
        syncing: false,
        offline: true,
        loading: false,
      }
    default:
      throw new Error(`Unknown action ${action.type}`)
  }
}

const ChainStateContext = React.createContext()

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

function useChainState() {
  const [{context}] = useAppMachine()
  return context.sync
}

export {ChainProvider, useChainState}
