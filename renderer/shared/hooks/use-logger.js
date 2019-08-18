import React from 'react'

export default function useLogger([state, dispatch]) {
  const actionRef = React.useRef()

  const newDispatchRef = React.useRef(action => {
    actionRef.current = action
    dispatch(action)
  })

  React.useEffect(() => {
    const action = actionRef.current

    if (action) {
      console.group('Dispatch')
      console.log('Action:', action)
      console.log('State:', state)
      console.groupEnd()

      global.ipcRenderer.send('log', 'Dispatch')
      global.ipcRenderer.send('log', 'Action', action)
      global.ipcRenderer.send('log', 'State', state)
      global.ipcRenderer.send('log', '----')
    }
  }, [state])

  return [state, newDispatchRef.current]
}
