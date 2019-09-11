import {useState, useEffect, useRef} from 'react'
import dequal from 'dequal'
import {loadItem, persistItem, loadState, persistState} from '../utils/persist'

export function usePersistentState(dbName, key, initialValue) {
  const [value, setValue] = useState(
    () => loadItem(dbName, key) || initialValue
  )

  useEffect(() => {
    // if we have something to write
    if (value) {
      persistItem(dbName, key, value)
    }
  }, [dbName, key, value])

  return [value, setValue]
}

export function usePersistence([state, dispatch], name) {
  const lastStateRef = useRef()
  const actionRef = useRef()

  const newDispatchRef = useRef(action => {
    actionRef.current = action
    dispatch(action)
  })

  useEffect(() => {
    if (actionRef.current) {
      if (!dequal(lastStateRef.current, state)) {
        persistState(name, state)
      }
      lastStateRef.current = state
    } else if (!loadState(name)) {
      persistState(name, state)
    }
  }, [name, state])

  return [
    actionRef.current ? state : loadState(name) || state,
    newDispatchRef.current,
  ]
}
