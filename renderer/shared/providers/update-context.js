import React, {useEffect} from 'react'

import {node} from 'prop-types'
import {AUTO_UPDATE_EVENT, AUTO_UPDATE_COMMAND} from '../../../main/channels'
import {useSettingsState} from './settings-context'
import {useInterval} from '../hooks/use-interval'
import {fetchNodeVersion} from '../api'
import {isHardFork} from '../utils/node'

export const TOGGLE_NODE_SWITCHER = 'TOGGLE_NODE_SWITCHER'
export const SAVE_EXTERNAL_URL = 'SAVE_EXTERNAL_URL'
const SHOW_EXTERNAL_UPDATE_MODAL = 'SHOW_EXTERNAL_UPDATE_MODAL'
const HIDE_EXTERNAL_UPDATE_MODAL = 'HIDE_EXTERNAL_UPDATE_MODAL'
const UI_UPDATE_READY = 'UI_UPDATE_READY'
const NODE_UPDATE_AVAILABLE = 'NODE_UPDATE_AVAILABLE'
const NODE_UPDATE_READY = 'NODE_UPDATE_READY'
const NEW_NODE_VERSION = 'NEW_CURRENT_VERSION'
const NODE_UPDATE_START = 'NODE_UPDATE_START'
const NODE_UPDATE_SUCCESS = 'NODE_UPDATE_SUCCESS'
const NODE_DOWNLOAD_PROGRESS = 'NODE_DOWNLOAD_PROGRESS'
const NODE_UPDATE_FAIL = 'NODE_UPDATE_FAIL'

const initialState = {
  checkStarted: false,
  uiCurrentVersion: global.appVersion,
  nodeCurrentVersion: '0.0.0',
  showExternalUpdateModal: false,
}

function updateReducer(state, action) {
  switch (action.type) {
    case NEW_NODE_VERSION: {
      return {
        ...state,
        nodeCurrentVersion: action.data,
        nodeUpdateAvailable: false,
        nodeUpdateReady: false,
      }
    }
    case NODE_UPDATE_AVAILABLE:
      return {
        ...state,
        nodeUpdateAvailable: true,
        nodeRemoteVersion: action.data,
      }
    case NODE_DOWNLOAD_PROGRESS: {
      return {
        ...state,
        nodeProgress: action.data,
      }
    }
    case NODE_UPDATE_READY:
      return {
        ...state,
        nodeUpdateReady: true,
        nodeRemoteVersion: action.data,
      }
    case UI_UPDATE_READY:
      return {
        ...state,
        uiUpdateReady: true,
        uiRemoteVersion: action.data,
      }
    case SHOW_EXTERNAL_UPDATE_MODAL: {
      return {
        ...state,
        showExternalUpdateModal: true,
      }
    }
    case HIDE_EXTERNAL_UPDATE_MODAL: {
      return {
        ...state,
        showExternalUpdateModal: false,
      }
    }
    case NODE_UPDATE_START: {
      return {
        ...state,
        nodeUpdating: true,
        nodeProgress: null,
      }
    }
    case NODE_UPDATE_SUCCESS: {
      return {
        ...state,
        nodeUpdating: false,
        nodeUpdateReady: false,
        nodeUpdateAvailable: false,
      }
    }
    case NODE_UPDATE_FAIL: {
      return {
        ...state,
        nodeUpdating: false,
      }
    }
    default:
      return state
  }
}

const AutoUpdateStateContext = React.createContext()
const AutoUpdateDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
export function AutoUpdateProvider({children}) {
  const settings = useSettingsState()

  const [state, dispatch] = React.useReducer(updateReducer, initialState)

  useEffect(() => {
    const onEvent = (_sender, event, data) => {
      switch (event) {
        case 'node-update-available':
          if (!state.nodeUpdateAvailable)
            dispatch({type: NODE_UPDATE_AVAILABLE, data: data.version})
          break
        case 'node-download-progress':
          dispatch({type: NODE_DOWNLOAD_PROGRESS, data})
          break
        case 'node-update-ready':
          if (
            !state.nodeUpdateReady &&
            data.version !== node.nodeCurrentVersion
          )
            dispatch({type: NODE_UPDATE_READY, data: data.version})
          break
        case 'node-updated':
          dispatch({type: NODE_UPDATE_SUCCESS})
          break
        case 'node-update-failed':
          dispatch({type: NODE_UPDATE_FAIL})
          break
        case 'ui-download-progress':
          break
        case 'ui-update-ready':
          dispatch({type: UI_UPDATE_READY, data: data.version})
          break
        default:
      }
    }

    global.ipcRenderer.on(AUTO_UPDATE_EVENT, onEvent)

    return () => {
      global.ipcRenderer.removeListener(AUTO_UPDATE_EVENT, onEvent)
    }
  })

  useEffect(() => {
    if (state.nodeCurrentVersion !== '0.0.0') {
      global.ipcRenderer.send(AUTO_UPDATE_COMMAND, 'start-checking', {
        nodeCurrentVersion: state.nodeCurrentVersion,
        isInternalNode: !settings.useExternalNode,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.useExternalNode, settings.url, state.nodeCurrentVersion])

  useInterval(
    async () => {
      try {
        const version = await fetchNodeVersion()
        if (version && state.nodeCurrentVersion !== version) {
          dispatch({type: NEW_NODE_VERSION, data: version})
        }
      } catch (error) {
        global.logger.error('Error fetching node version', error, state)
      }
    },
    10000,
    true
  )

  const canUpdateClient = state.uiUpdateReady

  const canUpdateNode =
    !state.nodeUpdating &&
    ((!settings.useExternalNode &&
      state.nodeUpdateReady &&
      state.nodeRemoteVersion !== state.nodeCurrentVersion) ||
      (settings.useExternalNode && state.nodeUpdateAvailable))

  const mustUpdateNode =
    canUpdateNode &&
    isHardFork(state.nodeCurrentVersion, state.nodeRemoteVersion)

  const updateClient = () => {
    global.ipcRenderer.send(AUTO_UPDATE_COMMAND, 'update-ui')
  }

  const updateNode = () => {
    if (settings.useExternalNode) {
      dispatch({type: SHOW_EXTERNAL_UPDATE_MODAL})
    } else {
      global.ipcRenderer.send(AUTO_UPDATE_COMMAND, 'update-node')
      dispatch({type: NODE_UPDATE_START})
    }
  }

  const hideExternalNodeUpdateModal = () => {
    dispatch({type: HIDE_EXTERNAL_UPDATE_MODAL})
  }

  return (
    <AutoUpdateStateContext.Provider
      value={{
        ...state,
        canUpdateClient,
        canUpdateNode,
        mustUpdateNode,
      }}
    >
      <AutoUpdateDispatchContext.Provider
        value={{
          updateClient,
          updateNode,
          hideExternalNodeUpdateModal,
        }}
      >
        {children}
      </AutoUpdateDispatchContext.Provider>
    </AutoUpdateStateContext.Provider>
  )
}

export function useAutoUpdateState() {
  const context = React.useContext(AutoUpdateStateContext)
  if (context === undefined) {
    throw new Error(
      'useAutoUpdateState must be used within a AutoUpdateProvider'
    )
  }
  return context
}

export function useAutoUpdateDispatch() {
  const context = React.useContext(AutoUpdateDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useAutoUpdateDispatch must be used within a AutoUpdateProvider'
    )
  }
  return context
}

export function useAutoUpdate() {
  return [useAutoUpdateState(), useAutoUpdateDispatch()]
}
