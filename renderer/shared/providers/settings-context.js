import React, {useEffect, useState} from 'react'
import semver from 'semver'
import {usePersistence} from '../hooks/use-persistent-state'
import {loadState} from '../utils/persist'
import {BASE_API_URL, BASE_INTERNAL_API_PORT} from '../api/api-client'
import useLogger from '../hooks/use-logger'

const SETTINGS_INITIALIZE = 'SETTINGS_INITIALIZE'
const TOGGLE_INTERNL_NODE = 'ENABLE_INTERNAL_NODE'
const SAVE_EXTERNAL_URL = 'SAVE_EXTERNAL_URL'
const UPDATE_UI_VERSION = 'UPDATE_UI_VERSION'

const initialState = {
  url: BASE_API_URL,
  internalPort: BASE_INTERNAL_API_PORT,
  tcpPort: 50505,
  ipfsPort: 50506,
  uiVersion: global.appVersion,
  useInternalNode: false,
}

function settingsReducer(state, action) {
  switch (action.type) {
    case TOGGLE_INTERNL_NODE: {
      const newState = {...state, useInternalNode: action.data}
      if (newState.userBeforeInternalNode && newState.useInternalNode) {
        delete newState.userBeforeInternalNode
      }
      return newState
    }
    case SAVE_EXTERNAL_URL:
      return {...state, url: action.data}
    case SETTINGS_INITIALIZE:
      return {
        ...initialState,
        ...state,
        initialized: true,
        useInternalNode: action.data.useInternalNode,
        userBeforeInternalNode: !action.data.useInternalNode,
      }
    case UPDATE_UI_VERSION: {
      return {
        ...state,
        uiVersion: action.data,
      }
    }
    default:
      return state
  }
}

const SettingsStateContext = React.createContext()
const SettingsDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function SettingsProvider({children}) {
  const firstRun = global.isFirstRun

  const [state, dispatch] = usePersistence(
    useLogger(
      React.useReducer(settingsReducer, loadState('settings') || initialState)
    ),
    'settings'
  )

  const [showTransferModal, toggleTransferModal] = useState(false)

  useEffect(() => {
    if (!state.initialized) {
      dispatch({
        type: SETTINGS_INITIALIZE,
        data: {useInternalNode: firstRun},
      })
    }
  }, [dispatch, firstRun, state.initialized])

  useEffect(() => {
    if (state.uiVersion && semver.lt(state.uiVersion, global.appVersion)) {
      dispatch({type: UPDATE_UI_VERSION, data: global.appVersion})
    }
  })

  const saveExternalUrl = url => {
    dispatch({type: SAVE_EXTERNAL_URL, data: url})
  }

  const toggleInternalNode = enable => {
    dispatch({type: TOGGLE_INTERNL_NODE, data: enable})
  }

  return (
    <SettingsStateContext.Provider value={{...state, showTransferModal}}>
      <SettingsDispatchContext.Provider
        value={{
          saveExternalUrl,
          toggleInternalNode,
          toggleTransferModal,
        }}
      >
        {children}
      </SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  )
}

function useSettingsState() {
  const context = React.useContext(SettingsStateContext)
  if (context === undefined) {
    throw new Error(
      'useSettingsState must be used within a SettingsStateProvider'
    )
  }
  return context
}

function useSettingsDispatch() {
  const context = React.useContext(SettingsDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useSettingsDispatch must be used within a SettingsDispatchContext'
    )
  }
  return context
}

export {SettingsProvider, useSettingsState, useSettingsDispatch}
