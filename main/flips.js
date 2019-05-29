const Store = require('electron-store')

const store = new Store({
  name: 'flips',
})

function getDrafts() {
  return store.get('drafts', [])
}

function getDraft(id) {
  return store.get('drafts', []).find(draft => draft.id === id)
}

function saveDrafts(drafts) {
  store.set('drafts', drafts)
}

function addDraft(draft) {
  const drafts = store.get('drafts', [])
  store.set('drafts', drafts.concat(draft))
}

function updateDraft(draft) {
  const drafts = store.get('drafts', [])
  const draftIdx = drafts.findIndex(({id}) => id === draft.id)
  if (draftIdx > -1) {
    const nextDrafts = [
      ...drafts.slice(0, draftIdx),
      {...drafts[draftIdx], ...draft},
      ...drafts.slice(draftIdx + 1),
    ]
    store.set('drafts', nextDrafts)
    return nextDrafts
  }
  return drafts
}

function deleteDraft(id) {
  const drafts = store.get('drafts', [])
  const deletingIdx = store
    .get('drafts', [])
    .findIndex(({id: currId}) => currId === id)
  if (deletingIdx > -1) {
    const nextDrafts = [
      ...drafts.slice(0, deletingIdx),
      ...drafts.slice(deletingIdx + 1),
    ]
    store.set('drafts', nextDrafts)
    return nextDrafts
  }
  return drafts
}

function clearDrafts() {
  store.set('drafts', [])
}

function publishFlip(flip) {
  const flips = store.get('flips', [])
  store.set(flips.concat(flip))
}

function clear() {
  store.clear()
}

module.exports = {
  store,
  getDrafts,
  getDraft,
  saveDrafts,
  addDraft,
  updateDraft,
  deleteDraft,
  clearDrafts,
  publishFlip,
  clear,
}
