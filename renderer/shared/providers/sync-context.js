import React from 'react'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {fetchSync} from '../api'

const SyncStateContext = React.createContext()
const SyncDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function SyncProvider({children}) {
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
    syncing ? 10000 : null,
    true
  )

  return (
    <SyncStateContext.Provider value={{syncing, progress}}>
      <SyncDispatchContext.Provider value={null}>
        {children}
      </SyncDispatchContext.Provider>
    </SyncStateContext.Provider>
  )
}

function useSyncState() {
  const context = React.useContext(SyncStateContext)
  if (context === undefined) {
    throw new Error('useChainState must be used within a SyncProvider')
  }
  return context
}

function useSyncDispatch() {
  const context = React.useContext(SyncDispatchContext)
  if (context === undefined) {
    throw new Error('useChainDispatch must be used within a SyncProvider')
  }
  return context
}

export {SyncProvider, useSyncState, useSyncDispatch}
