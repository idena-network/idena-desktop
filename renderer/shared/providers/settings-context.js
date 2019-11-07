import React, {useEffect} from 'react'
import semver from 'semver'
import {usePersistence} from '../hooks/use-persistent-state'
import {loadState} from '../utils/persist'
import {BASE_API_URL, BASE_INTERNAL_API_PORT} from '../api/api-client'
import {UI_UPDATE_EVENT} from '../../../main/channels'

const SETTINGS_INITIALIZE = 'SETTINGS_INITIALIZE'
const UI_UPDATED = 'UI_UPDATED'
export const TOGGLE_NODE_SWITCHER = 'TOGGLE_NODE_SWITCHER'
export const SAVE_EXTERNAL_URL = 'SAVE_EXTERNAL_URL'
export const UI_UPDATE_READY = 'UI_UPDATE_READY'

const initialState = {
  url: BASE_API_URL,
  internalPort: BASE_INTERNAL_API_PORT,
}

function settingsReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_NODE_SWITCHER':
      return {...state, useInternalNode: !state.useInternalNode}
    case 'SAVE_EXTERNAL_URL':
      return {...state, url: action.data}
    case 'SETTINGS_INITIALIZE':
      return {
        ...state,
        initialized: true,
        uiVersion: global.appVersion,
        useInternalNode: action.data.useInternalNode,
      }
    case 'UI_UPDATE_READY':
      return {
        ...state,
        uiUpdateReady: true,
        uiRemoteVersion: action.data.version,
      }
    case 'UI_UPDATED':
      return {
        ...state,
        uiVersion: action.data,
        uiUpdateReady: false,
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
    React.useReducer(settingsReducer, loadState('settings') || initialState),
    'settings'
  )

  useEffect(() => {
    const onEvent = (_sender, event, data) => {
      console.log(event, data)
      switch (event) {
        case 'download-progress':
          break
        case 'update-ready':
          dispatch({type: UI_UPDATE_READY, data})
          break
        default:
      }
    }

    global.ipcRenderer.on(UI_UPDATE_EVENT, onEvent)

    return () => {
      global.ipcRenderer.removeListener(UI_UPDATE_EVENT, onEvent)
    }
  })

  useEffect(() => {
    if (!state.initialized) {
      dispatch({
        type: SETTINGS_INITIALIZE,
        data: {useInternalNode: firstRun},
      })
    }
  }, [dispatch, firstRun, state.initialized])

  useEffect(() => {
    if (semver.lt(state.uiVersion, global.appVersion)) {
      dispatch({type: UI_UPDATED, data: global.appVersion})
    }
  })

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider value={dispatch}>
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
