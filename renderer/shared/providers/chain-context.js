import React, {useEffect, useState, useReducer} from 'react'
import {clearQueryCache} from 'react-query'

import {useRpc} from '../api/api-client'
import {useSettingsState} from './settings-context'
import useLogger from '../hooks/use-logger'

const ChainStateContext = React.createContext()

export function ChainProvider(props) {
  const {data, error, isLoading} = useRpc('bcn_syncing')
  const {useExternalNode} = useSettingsState()

  const [state, dispatch] = useLogger(
    useReducer(
      // eslint-disable-next-line no-shadow
      (state, [type, data]) => {
        switch (type) {
          case 'SET_LOADING': {
            return {
              ...state,
              loading: true,
            }
          }
          case 'FETCH_SYNC_SUCCEEDED': {
            return {
              ...state,
              ...data,
              offline: false,
              loading: false,
            }
          }
          case 'FETCH_SYNC_FAILED':
            return {
              ...state,
              syncing: false,
              offline: true,
              loading: false,
            }
          default:
            throw new Error(`Unknown action ${type}`)
        }
      },
      {
        loading: true,
        offline: true,
        syncing: false,
        currentBlock: null,
        highestBlock: null,
      }
    )
  )

  useEffect(() => {
    dispatch(['SET_LOADING'])
  }, [dispatch, useExternalNode])

  useEffect(() => {
    if (!isLoading && !!data) {
      dispatch(['FETCH_SYNC_SUCCEEDED', data])
    }
  }, [data, dispatch, isLoading])

  useEffect(() => {
    if (!isLoading && !!error) {
      dispatch(['FETCH_SYNC_FAILED'])
    }
  }, [dispatch, error, isLoading])

  return <ChainStateContext.Provider value={state} {...props} />
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
