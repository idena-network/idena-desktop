export const FLIPS_STORAGE_KEY = 'idena/flips'
export const FLIP_DRAFTS_STORAGE_KEY = 'idena/flips/drafts'
export const FLIPS_FILTER = 'idena/flips/filter'

export function getFromLocalStorage(key, fallbackValue = []) {
  return JSON.parse(localStorage.getItem(key)) || fallbackValue
}

export function setToLocalStorage(key, item) {
  return localStorage.setItem(key, JSON.stringify(item))
}

export function appendToLocalStorage(key, newItem) {
  const prevItem = getFromLocalStorage(key)
  localStorage.setItem(key, JSON.stringify(prevItem.concat(newItem)))
}
