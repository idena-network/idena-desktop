import React from 'react'
import {removeKeys} from '../utils/obj'

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

      global.logger.debug('--- START DISPATCH ---')
      global.logger.debug('Action', action)
      global.logger.debug('State', removeKeys(state, 'hex'))
      global.logger.debug('--- END DISPATCH ---')
    }
  }, [state])

  return [state, newDispatchRef.current]
}
