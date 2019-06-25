import React from 'react'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {fetchSync} from '../api'

const ChainStateContext = React.createContext()
const ChainDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function ChainProvider({children}) {
  const [syncing, setSyncing] = React.useState(true)
  const [progress, setProgress] = React.useState(null)

  useInterval(
    async () => {
      try {
        // eslint-disable-next-line no-shadow
        const {syncing, currentBlock, highestBlock} = await fetchSync()
        setSyncing(syncing)
        setProgress(currentBlock / highestBlock)
      } catch (error) {
        throw new Error(error.message)
      }
    },
    syncing ? 1000 : null,
    true
  )

  return (
    <ChainStateContext.Provider value={{syncing, progress}}>
      <ChainDispatchContext.Provider value={null}>
        {children}
      </ChainDispatchContext.Provider>
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

function useChainDispatch() {
  const context = React.useContext(ChainDispatchContext)
  if (context === undefined) {
    throw new Error('useChainDispatch must be used within a ChainProvider')
  }
  return context
}

export {ChainProvider, useChainState, useChainDispatch}
