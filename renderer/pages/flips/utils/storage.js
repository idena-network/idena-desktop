export const FLIPS_STORAGE_KEY = 'idena-flips'
export const FLIP_DRAFTS_STORAGE_KEY = 'idena/flips/drafts'

export function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || []
}

export function appendToLocalStorage(key, newItem) {
  const prevItem = getFromLocalStorage(key)
  localStorage.setItem(key, JSON.stringify(prevItem.concat(newItem)))
}
