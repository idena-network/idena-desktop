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

function saveFlips(flips) {
  if (flips.length > 0) {
    store.set(keyName, flips)
  }
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
  store.set(
    keyName,
    drafts.map(flip =>
      flip.id === id ? flip : {...flip, type: 'Removed', images: null}
    )
  )
  return id
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
  clear,
}
