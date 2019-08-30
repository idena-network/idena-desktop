import React from 'react'

const {logger} = global

export default function useLogger([state, dispatch]) {
  const actionRef = React.useRef()

  const newDispatchRef = React.useRef(action => {
    actionRef.current = action
    dispatch(action)
  })

  React.useEffect(() => {
    const action = actionRef.current

    if (action) {
      console.group('DISPATCH')
      console.log('Action:', action)
      console.log('State:', state)
      console.groupEnd()

      logger.debug('--- START DISPATCH ---')
      logger.debug('Action', action)
      logger.debug('State', state)
      logger.debug('--- END DISPATCH ---')
    }
  }, [state])

  return [state, newDispatchRef.current]
}
