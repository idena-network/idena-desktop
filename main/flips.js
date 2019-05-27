const Store = require('electron-store')

const store = new Store({
  name: "flips"
})

function getDrafts() {
  return store.get('drafts', [])
}

function saveDraft(flip) {
  return store.set('drafts', flip)
}

module.exports = {
  store, 
  getDrafts,
  saveDraft
}
