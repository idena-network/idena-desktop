import React from 'react'
import {useRpc} from '../api/api-client'
import {useSettingsState} from './settings-context'

const ChainStateContext = React.createContext()

export function ChainProvider({offlineFallback, ...props}) {
  const {data, error, isLoading} = useRpc('bcn_syncing')
  const {useExternalNode} = useSettingsState()

  if (data === null || isLoading) return null
  if (error) return offlineFallback
  if (data)
    return (
      <ChainStateContext.Provider
        value={{...data, loading: !data && useExternalNode}}
        {...props}
      />
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
