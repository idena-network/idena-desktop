import React from 'react'

const {logger} = global

// TODO: pass log fn default to console.log
export default function useLogger([state, dispatch]) {
  const actionRef = React.useRef()

  const newDispatchRef = React.useRef(action => {
    actionRef.current = action
    dispatch(action)
  })

  React.useEffect(() => {
    const action = actionRef.current

    if (action) {
      const plainAction = {...action}
      const plainState = {...state}

      console.group('DISPATCH')
      console.log('Action:', plainAction)
      console.log('State:', plainState)
      console.groupEnd()

      logger.debug('--- START DISPATCH ---')
      logger.debug('Action', plainAction)
      logger.debug('State', plainState)
      logger.debug('--- END DISPATCH ---')
    }
  }, [state])

  return [state, newDispatchRef.current]
}
