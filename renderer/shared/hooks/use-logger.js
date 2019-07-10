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
    }
  }, [state])

  return [state, newDispatchRef.current]
}
