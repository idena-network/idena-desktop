import React, {useEffect} from 'react'
import {NODE_EVENT, NODE_COMMAND} from '../../../main/channels'
import {useSettingsState} from './settings-context'
import useLogger from '../hooks/use-logger'

const NODE_READY = 'NODE_READY'
const NODE_FAILED = 'NODE_FAILED'
const NODE_START = 'NODE_START'
const NODE_STOP = 'NODE_STOP'
const NODE_REINIT = 'NODE_REINIT'

const initialState = {
  nodeStarted: false,
  nodeReady: false,
  nodeFailed: false,
  logs: [],
}

function nodeReducer(state, action) {
  switch (action.type) {
    case NODE_FAILED: {
      return {
        ...state,
        nodeFailed: true,
        nodeReady: false,
        nodeStarted: false,
      }
    }
    case NODE_READY: {
      return {
        ...state,
        nodeReady: true,
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
    case NODE_REINIT: {
      return {
        ...state,
        nodeReady: false,
        nodeFailed: false,
      }
    }
    default:
      throw new Error(`Unknown action ${action.type}`)
  }
}

const NodeStateContext = React.createContext()
const NodeDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
export function NodeProvider({children}) {
  const settings = useSettingsState()

  const [state, dispatch] = useLogger(
    React.useReducer(nodeReducer, initialState)
  )

  useEffect(() => {
    const onEvent = (_sender, event, data) => {
      switch (event) {
        case 'node-failed':
          dispatch({type: NODE_FAILED})
          break
        case 'node-started':
          dispatch({type: NODE_START})
          break
        case 'node-stopped':
          dispatch({type: NODE_STOP})
          break
        case 'node-ready':
          dispatch({type: NODE_READY, data})
          break
        case 'state-cleaned':
          dispatch({type: NODE_REINIT, data})
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
    dispatch({type: NODE_REINIT})
  }, [settings.runInternalNode, dispatch])

  useEffect(() => {
    if (
      state.nodeReady &&
      !state.nodeFailed &&
      !state.nodeStarted &&
      settings.runInternalNode &&
      settings.internalApiKey
    ) {
      global.ipcRenderer.send(NODE_COMMAND, 'start-local-node', {
        rpcPort: settings.internalPort,
        tcpPort: settings.tcpPort,
        ipfsPort: settings.ipfsPort,
        apiKey: settings.internalApiKey,
      })
    }
  }, [
    settings.internalPort,
    state.nodeReady,
    state.nodeStarted,
    settings.runInternalNode,
    settings.tcpPort,
    settings.ipfsPort,
    state.nodeFailed,
    settings.internalApiKey,
  ])

  useEffect(() => {
    if (state.nodeReady || state.nodeFailed) {
      return
    }
    if (settings.runInternalNode) {
      if (!state.nodeStarted) {
        global.ipcRenderer.send(NODE_COMMAND, 'init-local-node')
      }
    } else if (state.nodeStarted) {
      global.ipcRenderer.send(NODE_COMMAND, 'stop-local-node')
    }
  }, [
    settings.runInternalNode,
    state.nodeStarted,
    state.nodeReady,
    state.nodeFailed,
  ])

  const tryRestartNode = () => {
    dispatch({type: NODE_REINIT})
  }

  const importNodeKey = () => {
    global.ipcRenderer.send(NODE_COMMAND, 'clean-state')
  }

  return (
    <NodeStateContext.Provider value={state}>
      <NodeDispatchContext.Provider value={{tryRestartNode, importNodeKey}}>
        {children}
      </NodeDispatchContext.Provider>
    </NodeStateContext.Provider>
  )
}

export function useNodeState() {
  const context = React.useContext(NodeStateContext)
  if (context === undefined) {
    throw new Error('useNodeState must be used within a NodeStateProvider')
  }
  return context
}

export function useNodeDispatch() {
  const context = React.useContext(NodeDispatchContext)
  if (context === undefined) {
    throw new Error('useNodeState must be used within a NodeDispatchProvider')
  }
  return context
}
