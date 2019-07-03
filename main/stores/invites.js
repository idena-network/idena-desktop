const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const nanoid = require('nanoid')
const {dbPath} = require('./setup')

const adapter = new FileSync(dbPath('invites.json'))
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({invites: [], activationTx: '', activationCode: ''}).write()

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
    getInvites()
      .push({id: nanoid(), ...invite})
      .write()
  },
  removeInvite({id}) {
    getInvites()
      .remove({id})
      .write()
  },
  clearInvites() {
    getInvites()
      .remove()
      .write()
  },
  getActivationTx() {
    return db.get('activationTx').value()
  },
  setActivationTx(hash) {
    db.set('activationTx', hash).write()
  },
  clearActivationTx() {
    db.set('activationTx', '').write()
  },
  getActivationCode() {
    return db.get('activationCode').value()
  },
  setActivationCode(code) {
    db.set('activationCode', code).write()
  },
  clearActivationCode() {
    db.set('activationCode', '').write()
  },
}
