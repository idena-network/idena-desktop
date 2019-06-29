const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const nanoid = require('nanoid')
const {dbPath} = require('./setup')

const adapter = new FileSync(dbPath('invites.json'))
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({invites: [], activationTx: ''}).write()

function getInvites() {
  return db.get('invites')
}

module.exports = {
  getInvites() {
    return getInvites().value()
  },
  getInvite(id) {
    return getInvites()
      .find({id})
      .read()
  },
  addInvite(invite) {
    return getInvites()
      .push({id: nanoid(), ...invite})
      .write()
  },
  removeInvite({id}) {
    return getInvites()
      .remove({id})
      .write()
  },
  clearInvites() {
    return getInvites()
      .remove()
      .write()
  },
  getActivationTx() {
    db.get('activationTx').value()
  },
  setActivationTx(hash) {
    db.set('activationTx', hash).write()
  },
  clearActivationTx() {
    db.set('activationTx', '').write()
  },
}
