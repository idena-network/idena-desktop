import React, {useEffect} from 'react'
import {NODE_EVENT, NODE_COMMAND} from '../../../main/channels'
import {useSettingsState} from './settings-context'

const NODE_READY = 'NODE_READY'
const INIT_FAILED = 'INIT_FAILED'
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
  console.log(state, action)

  switch (action.type) {
    case INIT_FAILED: {
      return {
        ...state,
        nodeFailed: true,
        nodeReady: false,
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
function NodeProvider({children}) {
  const settings = useSettingsState()

  const [state, dispatch] = React.useReducer(nodeReducer, initialState)

  useEffect(() => {
    const onEvent = (_sender, event, data) => {
      switch (event) {
        case 'node-failed':
          dispatch({type: INIT_FAILED})
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
  }, [settings.useInternalNode])

  useEffect(() => {
    if (
      state.nodeReady &&
      !state.nodeFailed &&
      !state.nodeStarted &&
      settings.useInternalNode
    ) {
      global.ipcRenderer.send(NODE_COMMAND, 'start-local-node', {
        rpcPort: settings.internalPort,
        tcpPort: settings.tcpPort,
        ipfsPort: settings.ipfsPort,
      })
    }
  }, [
    settings.internalPort,
    state.nodeReady,
    state.nodeStarted,
    settings.useInternalNode,
    settings.tcpPort,
    settings.ipfsPort,
    state.nodeFailed,
  ])

  useEffect(() => {
    if (state.nodeReady || state.nodeFailed) {
      return
    }
    if (settings.useInternalNode) {
      if (!state.nodeStarted) {
        global.ipcRenderer.send(NODE_COMMAND, 'init-local-node')
      }
    } else if (state.nodeStarted) {
      global.ipcRenderer.send(NODE_COMMAND, 'stop-local-node')
    }
  }, [
    settings.useInternalNode,
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

function useNodeState() {
  const context = React.useContext(NodeStateContext)
  if (context === undefined) {
    throw new Error('useNodeState must be used within a NodeStateProvider')
  }
  return context
}

function useNodeDispatch() {
  const context = React.useContext(NodeDispatchContext)
  if (context === undefined) {
    throw new Error('useNodeState must be used within a NodeDispatchProvider')
  }
  return context
}

export {NodeProvider, useNodeState, useNodeDispatch}
