import React, {useEffect} from 'react'
import {NODE_EVENT, NODE_COMMAND} from '../../../main/channels'
import {loadState} from '../utils/persist'
import {usePersistence} from '../hooks/use-persistent-state'
import {BASE_API_URL, BASE_INTERNAL_API_PORT} from '../api/api-client'
import {fetchNodeVersion} from '../api'
import {useInterval} from '../hooks/use-interval'
import {useSettingsState} from './settings-context'

const semver = require('semver')

const NODE_DOWNLOAD_PROGRESS = 'NODE_DOWNLAOD_PROGRESS'
const NODE_READY = 'NODE_READY'
const NODE_DOWNLOAD_SUCCESS = 'NODE_DOWNLOAD_SUCCESS'
const NODE_DOWNLOAD_START = 'NODE_DOWNLOAD_START'
const NODE_DOWNLOAD_FAILED = 'NODE_DOWNLOAD_FAILED'
const INIT_FAILED = 'INIT_FAILED'
const UPDATE_NODE = 'UPDATE_NODE'
const NODE_UPDATED = 'NODE_UPDATED'
const CONTEXT_INITIALIZED = 'CONTEXT_INITIALIZED'
const NODE_START = 'NODE_START'
const NODE_STOP = 'NODE_STOP'
const NODE_SETTINGS_TOGGLED = 'NODE_SETTINGS_TOGGLED'
const NEW_REMOTE_VERSION = 'NEW_REMOTE_VERSION'
const NODE_UPDATE_READY = 'NODE_UPDATE_READY'
const NEW_CURRENT_VERSION = 'SET_CURRENT_VERSION'

const initialState = {
  nodeStarted: false,
  nodeReady: false,
  failed: false,
  progress: null,
  currentVersion: '0.0.0',
  remoteVersion: '0.0.0',
  logs: [],
  updateAvailable: false,
  updateReady: false,
  downloading: false,
  updating: false,
  initialized: false,
  useInternalNode: false,
}

function nodeReducer(state, action) {
  console.log(state, action)

  switch (action.type) {
    case CONTEXT_INITIALIZED: {
      return {
        ...state,
        initialized: true,
        ready: true,
      }
    }
    case INIT_FAILED: {
      return {
        ...state,
        failed: true,
      }
    }
    case NODE_READY: {
      return {
        ...state,
        progress: null,
        initialized: true,
        nodeReady: true,
        updateReady: false,
        updateAvailable: false,
        currentVersion: action.data || '0.0.0',
        updating: false,
      }
    }
    case NODE_START: {
      return {
        ...state,
        nodeStarted: true,
      }
    }
    case NODE_STOP: {
      return {
        ...state,
        nodeStarted: false,
      }
    }
    case NODE_DOWNLOAD_START: {
      return {
        ...state,
        downloading: true,
        remoteVersion: state.remoteVersion || action.data || '0.0.0',
      }
    }
    case NODE_DOWNLOAD_PROGRESS: {
      return {
        ...state,
        progress: action.data,
      }
    }
    case NODE_UPDATE_READY:
    case NODE_DOWNLOAD_SUCCESS: {
      return {
        ...state,
        downloading: false,
        updateReady: true,
      }
    }
    case NODE_DOWNLOAD_FAILED: {
      return {
        ...state,
        downloading: false,
        updateAvailable: false,
      }
    }
    case UPDATE_NODE: {
      return {
        ...state,
        nodeReady: false,
        updating: true,
      }
    }
    case NODE_SETTINGS_TOGGLED: {
      return {
        ...state,
        initialized: false,
        useInternalNode: action.data,
      }
    }
    case NEW_REMOTE_VERSION: {
      return {
        ...state,
        remoteVersion: action.data || '0.0.0',
      }
    }
    case NEW_CURRENT_VERSION: {
      return {
        ...state,
        currentVersion: action.data || '0.0.0',
      }
    }
    default:
      throw new Error(`Unknown action ${action.type}`)
  }
}

const NodeStateContext = React.createContext()

// eslint-disable-next-line react/prop-types
function NodeProvider({children}) {
  const settings = useSettingsState()

  const [state, dispatch] = React.useReducer(nodeReducer, {
    ...initialState,
    useInternalNode: settings.useInternalNode,
  })

  useEffect(() => {
    if (settings.initialized) {
      dispatch({type: NODE_SETTINGS_TOGGLED, data: settings.useInternalNode})
    }
  }, [settings.initialized, settings.useInternalNode])

  useEffect(() => {
    const onEvent = (_sender, event, data) => {
      switch (event) {
        case 'init-failed':
          dispatch({type: INIT_FAILED})
          break
        case 'download-started':
          dispatch({type: NODE_DOWNLOAD_START, data})
          break
        case 'download-progress':
          dispatch({type: NODE_DOWNLOAD_PROGRESS, data})
          break
        case 'download-finished':
          if (!state.updateReady) dispatch({type: NODE_DOWNLOAD_SUCCESS})
          break
        case 'download-failed':
          dispatch({type: NODE_DOWNLOAD_FAILED})
          break
        case 'node-start':
          dispatch({type: NODE_START})
          break
        case 'node-stop':
          dispatch({type: NODE_STOP})
          break
        case 'node-ready':
          dispatch({type: NODE_READY, data})
          break
        case 'node-updated':
          dispatch({type: NODE_UPDATED})
          break
        case 'remote-version':
          if (data && state.remoteVersion !== data)
            dispatch({type: NEW_REMOTE_VERSION, data})
          break
        default:
      }
    }

    global.ipcRenderer.on(NODE_EVENT, onEvent)

    return () => {
      global.ipcRenderer.removeListener(NODE_EVENT, onEvent)
    }
  })

  useEffect(() => {
    if (state.nodeReady && !state.nodeStarted && state.useInternalNode) {
      global.ipcRenderer.send(NODE_COMMAND, 'start-local-node', {
        rpcPort: settings.internalPort,
      })
    }
  }, [
    settings.internalPort,
    state.nodeReady,
    state.nodeStarted,
    state.useInternalNode,
  ])

  useEffect(() => {
    if (state.updating) {
      global.ipcRenderer.send(NODE_COMMAND, 'update-local-node')
    }
  }, [state.updating])

  useEffect(() => {
    if (state.initialized) {
      return
    }
    if (state.useInternalNode) {
      if (!state.nodeStarted) {
        global.ipcRenderer.send(NODE_COMMAND, 'init-local-node')
      }
    } else if (state.nodeStarted) {
      global.ipcRenderer.send(NODE_COMMAND, 'stop-local-node')
    } else {
      dispatch({type: CONTEXT_INITIALIZED})
    }
  }, [
    state.useInternalNode,
    state.initialized,
    state.nodeStarted,
    state.nodeReady,
  ])

  // interval only for checking current version of external node
  useInterval(
    async () => {
      try {
        const version = await fetchNodeVersion()
        if (version && state.currentVersion !== version) {
          dispatch({type: NEW_CURRENT_VERSION, data: version})
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    },
    !state.useInternalNode ? 10000 : null,
    true
  )

  // interval for checking if update available
  useInterval(
    async () => {
      if (
        !state.updateReady &&
        semver.lt(state.currentVersion, state.remoteVersion)
      ) {
        if (state.useInternalNode) {
          if (!state.downloading) {
            dispatch({type: NODE_DOWNLOAD_START})
            global.ipcRenderer.send(NODE_COMMAND, 'download-update')
          }
        } else {
          dispatch({type: NODE_UPDATE_READY})
        }
      }
    },
    semver.lt(state.currentVersion, state.remoteVersion) ? 5000 : null,
    true
  )

  const canUpdate = state.updateReady && state.ready

  const update = () => {
    dispatch({type: UPDATE_NODE})
  }

  return (
    <NodeStateContext.Provider
      value={{
        ...state,
        canUpdate,
        update,
      }}
    >
      {children}
    </NodeStateContext.Provider>
  )
}

function useNodeState() {
  const context = React.useContext(NodeStateContext)
  if (context === undefined) {
    throw new Error('useNodeState must be used within a NodeStateProvider')
  }
  return context
}

export {NodeProvider, useNodeState}
