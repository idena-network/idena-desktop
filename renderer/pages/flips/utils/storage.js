export const FLIPS_STORAGE_KEY = 'idena/flips'
export const FLIP_DRAFTS_STORAGE_KEY = 'idena/flips/drafts'
export const FLIPS_FILTER = 'idena/flips/filter'

export function getFromLocalStorage(key, fallbackValue = []) {
  return JSON.parse(localStorage.getItem(key)) || fallbackValue
}

export function setToLocalStorage(key, item) {
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error(error)
  }
}

export function appendToLocalStorage(key, newItem) {
  try {
    const prevItem = getFromLocalStorage(key)
    localStorage.setItem(key, JSON.stringify(prevItem.concat(newItem)))
  } catch (error) {
    console.error(error)
  }
}
