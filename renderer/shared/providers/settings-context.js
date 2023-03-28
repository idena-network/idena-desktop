import React, {useCallback, useEffect, useMemo} from 'react'
import semver from 'semver'
import {usePersistence} from '../hooks/use-persistent-state'
import {loadPersistentState} from '../utils/persist'
import {BASE_API_URL, BASE_INTERNAL_API_PORT} from '../api/api-client'
import useLogger from '../hooks/use-logger'
import {AVAILABLE_LANGS} from '../../i18n'

const SETTINGS_INITIALIZE = 'SETTINGS_INITIALIZE'
const TOGGLE_USE_EXTERNAL_NODE = 'TOGGLE_USE_EXTERNAL_NODE'
const TOGGLE_RUN_INTERNAL_NODE = 'TOGGLE_RUN_INTERNL_NODE'
const UPDATE_UI_VERSION = 'UPDATE_UI_VERSION'
const SET_INTERNAL_KEY = 'SET_INTERNAL_KEY'
const SET_CONNECTION_DETAILS = 'SET_CONNECTION_DETAILS'
const TOGGLE_AUTO_ACTIVATE_MINING = 'TOGGLE_AUTO_ACTIVATE_MINING'

const randomKey = () =>
  Math.random().toString(36).substring(2, 13) +
  Math.random().toString(36).substring(2, 13) +
  Math.random().toString(36).substring(2, 15)

const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE'

const initialState = {
  url: BASE_API_URL,
  internalPort: BASE_INTERNAL_API_PORT,
  tcpPort: 50505,
  ipfsPort: 50506,
  uiVersion: global.appVersion,
  useExternalNode: false,
  runInternalNode: true,
  internalApiKey: randomKey(),
  externalApiKey: '',
  lng: AVAILABLE_LANGS[0],
  autoActivateMining: true,
}

if (global.env && global.env.NODE_ENV === 'e2e') {
  initialState.url = global.env.NODE_MOCK
  initialState.runInternalNode = false
  initialState.useExternalNode = true
}

function settingsReducer(state, action) {
  switch (action.type) {
    case TOGGLE_USE_EXTERNAL_NODE: {
      return {...state, useExternalNode: action.data}
    }
    case TOGGLE_RUN_INTERNAL_NODE: {
      const newState = {...state, runInternalNode: action.data}
      if (newState.runInternalNode) {
        newState.useExternalNode = false
      }
      return newState
    }
    case SETTINGS_INITIALIZE:
      return {
        ...initialState,
        ...state,
        initialized: true,
      }
    case UPDATE_UI_VERSION: {
      return {
        ...state,
        uiVersion: action.data,
      }
    }
    case SET_INTERNAL_KEY: {
      return {
        ...state,
        internalApiKey: action.data,
      }
    }
    case SET_CONNECTION_DETAILS: {
      const {url, apiKey} = action
      return {
        ...state,
        url,
        externalApiKey: apiKey,
      }
    }
    case CHANGE_LANGUAGE: {
      return {
        ...state,
        lng: action.lng,
      }
    }
    case TOGGLE_AUTO_ACTIVATE_MINING: {
      return {
        ...state,
        autoActivateMining: !state.autoActivateMining,
      }
    }
    default:
      return state
  }
}

const SettingsStateContext = React.createContext()
const SettingsDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
export function SettingsProvider({children}) {
  const [state, dispatch] = usePersistence(
    useLogger(
      React.useReducer(settingsReducer, {
        autoActivateMining: initialState.autoActivateMining,
        ...(loadPersistentState('settings') || initialState),
      })
    ),
    'settings'
  )

  useEffect(() => {
    if (!state.initialized) {
      dispatch({
        type: SETTINGS_INITIALIZE,
      })
    }
  }, [dispatch, state.initialized])

  useEffect(() => {
    if (!state.internalApiKey) {
      dispatch({type: SET_INTERNAL_KEY, data: randomKey()})
    }
  })

  useEffect(() => {
    if (
      state.uiVersion &&
      global.appVersion &&
      semver.lt(state.uiVersion, global.appVersion)
    ) {
      dispatch({type: UPDATE_UI_VERSION, data: global.appVersion})
    }
  })

  const toggleUseExternalNode = useCallback(
    () => (enable) => {
      dispatch({type: TOGGLE_USE_EXTERNAL_NODE, data: enable})
    },
    [dispatch]
  )

  const toggleRunInternalNode = useCallback(
    () => (run) => {
      dispatch({type: TOGGLE_RUN_INTERNAL_NODE, data: run})
    },
    [dispatch]
  )

  const changeLanguage = useCallback(
    (lng) => dispatch({type: CHANGE_LANGUAGE, lng}),
    [dispatch]
  )

  const toggleAutoActivateMining = useCallback(() => {
    dispatch({type: TOGGLE_AUTO_ACTIVATE_MINING})
  }, [dispatch])

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider
        value={useMemo(
          () => ({
            toggleUseExternalNode,
            toggleRunInternalNode,
            changeLanguage,
            setConnectionDetails({url, apiKey}) {
              dispatch({type: SET_CONNECTION_DETAILS, url, apiKey})
            },
            toggleAutoActivateMining,
          }),
          [
            changeLanguage,
            dispatch,
            toggleAutoActivateMining,
            toggleRunInternalNode,
            toggleUseExternalNode,
          ]
        )}
      >
        {children}
      </SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  )
}

export function useSettingsState() {
  const context = React.useContext(SettingsStateContext)
  if (context === undefined) {
    throw new Error(
      'useSettingsState must be used within a SettingsStateProvider'
    )
  }
  return context
}

export function useSettingsDispatch() {
  const context = React.useContext(SettingsDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useSettingsDispatch must be used within a SettingsDispatchContext'
    )
  }
  return context
}

export function useSettings() {
  return [useSettingsState(), useSettingsDispatch()]
}
