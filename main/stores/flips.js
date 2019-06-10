const Store = require('electron-store')

const store = new Store({
  name: 'flips',
})

const keyName = 'flips'

function getFlips() {
  return store.get(keyName, [])
}

function getFlip(id) {
  return store.get(keyName, []).find(draft => draft.id === id)
}

function saveFlips(drafts) {
  store.set(keyName, drafts)
}

function addDraft(draft) {
  const drafts = store.get(keyName, [])
  store.set(keyName, drafts.concat(draft))
}

function updateDraft(draft) {
  const drafts = store.get(keyName, [])
  const draftIdx = drafts.findIndex(({id}) => id === draft.id)
  if (draftIdx > -1) {
    const nextDrafts = [
      ...drafts.slice(0, draftIdx),
      {...drafts[draftIdx], ...draft},
      ...drafts.slice(draftIdx + 1),
    ]
    store.set(keyName, nextDrafts)
    return nextDrafts
  }
  return drafts
}

function deleteDraft(id) {
  const drafts = store.get(keyName, [])
  const deletingIdx = store
    .get(keyName, [])
    .findIndex(({id: currId}) => currId === id)

  if (deletingIdx > -1) {
    const nextDrafts = [
      ...drafts.slice(0, deletingIdx),
      ...drafts.slice(deletingIdx + 1),
    ]
    store.set(keyName, nextDrafts)
    return nextDrafts
  }
  return drafts
}

function clearDrafts() {
  store.set(keyName, [])
}

function clear() {
  store.clear()
}

module.exports = {
  store,
  getFlips,
  getFlip,
  saveFlips,
  addDraft,
  updateDraft,
  deleteDraft,
  clearDrafts,
  clear,
}
