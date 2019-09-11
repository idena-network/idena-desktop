const loadDb = global.prepareDb || {}

export function loadState(dbName) {
  try {
    const value = loadDb(dbName).getState()

    return Object.keys(value).length === 0 ? null : value || null
  } catch (error) {
    return null
  }
}

export function loadItem(dbName, key) {
  if (!key) {
    throw new Error('loadItem requires key to be passed')
  }
  const state = loadState(dbName)
  return (state && state[key]) || null
}

export function persistItem(dbName, key, value) {
  // if we have something to save
  loadDb(dbName)
    .set(key, value)
    .write()
}

export function persistState(name, state) {
  loadDb(name)
    .setState(state)
    .write()
}
