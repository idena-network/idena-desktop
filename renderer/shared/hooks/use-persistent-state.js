import {useState, useEffect, useRef} from 'react'
import dequal from 'dequal'
import {
  loadItem,
  persistItem,
  loadState,
  persistState,
  shouldPersist,
} from '../utils/persist'

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

/**
 * Middleware-style hook persisting reducer state
 *
 * It also supports initial state 👏
 * @param {*} useReducer Original useReducer
 * @param {string} name Name of the file to be persisted in
 * @param {(string|string[])} [on] If passed whitelists actions triggering persistence
 */
export function usePersistence([state, dispatch], name, on) {
  const lastStateRef = useRef()
  const actionRef = useRef()

  const newDispatchRef = useRef(action => {
    actionRef.current = action
    dispatch(action)
  })

  useEffect(() => {
    const action = actionRef.current
    if (action && shouldPersist(on, action)) {
      if (!dequal(lastStateRef.current, state)) {
        persistState(name, state)
      }
      lastStateRef.current = state
    } else if (!loadState(name)) {
      persistState(name, state)
    }
    // TODO: Do we have something to do with the cleanup? 🤔 Weird case when actions come concurrently
  }, [name, on, state])

  return [
    actionRef.current ? state : loadState(name) || state,
    newDispatchRef.current,
  ]
}
