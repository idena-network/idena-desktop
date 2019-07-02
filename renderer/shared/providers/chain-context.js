import React from 'react'
import {useInterval} from '../hooks/use-interval'
import {fetchSync} from '../api'

const SYNC_SUCCEEDED = 'SYNC_STATE_FETCHED'
const SYNC_FAILED = 'SYNC_FAILED'

const initialState = {
  alive: null,
  syncing: null,
  progress: null,
}

function chainReducer(state, action) {
  const {syncing, currentBlock, highestBlock, alive} = action.payload
  switch (action.type) {
    case SYNC_SUCCEEDED:
      return {
        ...state,
        syncing,
        progress: currentBlock / highestBlock,
        alive: true,
      }
    case SYNC_FAILED:
      return {
        ...state,
        alive,
      }
    default:
      throw new Error(`Unknown action ${action.type}`)
  }
}

const ChainStateContext = React.createContext()

// eslint-disable-next-line react/prop-types
function ChainProvider({children}) {
  const [state, dispatch] = React.useReducer(chainReducer, initialState)

  useInterval(
    async () => {
      try {
        const syncState = await fetchSync()
        dispatch({type: SYNC_SUCCEEDED, payload: syncState})
      } catch (error) {
        dispatch({type: SYNC_FAILED, payload: {alive: false}})
      }
    },
    state.progress === 1 ? 30000 : 1000,
    true
  )

  return (
    <ChainStateContext.Provider value={state}>
      {children}
    </ChainStateContext.Provider>
  )
}

function useChainState() {
  const context = React.useContext(ChainStateContext)
  if (context === undefined) {
    throw new Error('useChainState must be used within a ChainProvider')
  }
  return context
}

export {ChainProvider, useChainState}
