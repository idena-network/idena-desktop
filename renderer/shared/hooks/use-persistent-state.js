import {useState, useEffect} from 'react'

const db = global.prepareDb || {}

function getPersistedValue(dbName) {
  try {
    const value = db(dbName).getState()
    return value || null
  } catch (error) {
    return null
  }
}

function setPersistedValue(name, key, value) {
  // if we have something to write
  if (value) {
    db(name)
      .set(key, value)
      .write()
  }
}

export default function usePersistentState(dbName, key, initialValue) {
  const [value, setValue] = useState(() => {
    const presistedState = getPersistedValue(dbName) || initialValue
    return presistedState[key]
  })

  useEffect(() => {
    setPersistedValue(dbName, key, value)
  }, [dbName, key, value])

  return [value, setValue]
}
