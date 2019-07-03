import React from 'react'
import {useInterval} from '../hooks/use-interval'
import {fetchSync} from '../api'

const FETCH_SYNC_SUCCEEDED = 'FETCH_SYNC_SUCCEEDED'
const FETCH_SYNC_FAILED = 'FETCH_SYNC_FAILED'

const initialState = {
  unreachable: null,
  syncing: null,
  currentBlock: null,
  highestBlock: null,
  progress: null,
}

function chainReducer(state, action) {
  switch (action.type) {
    case FETCH_SYNC_SUCCEEDED: {
      const {syncing, currentBlock, highestBlock} = action.payload
      return {
        ...state,
        currentBlock,
        highestBlock,
        syncing: Number.isFinite(currentBlock / highestBlock)
          ? syncing && currentBlock !== highestBlock
          : null,
        unreachable: false,
      }
    }
    case FETCH_SYNC_FAILED:
      return {
        ...state,
        syncing: null,
        unreachable: true,
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
        dispatch({type: FETCH_SYNC_SUCCEEDED, payload: syncState})
      } catch (error) {
        dispatch({type: FETCH_SYNC_FAILED})
      }
    },
    (state.syncing !== null && state.syncing) || state.unreachable
      ? 1000
      : 10000,
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
