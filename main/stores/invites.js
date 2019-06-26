const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const nanoid = require('nanoid')

const adapter = new FileSync('invites.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({invites: [], activationCode: '', activationTx: ''}).write()

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
      .update('sentInvites', n => n + 1)
      .write()
  },
  removeInvite({id}) {
    return getInvites()
      .remove({id})
      .update('sentInvites', n => n - 1)
      .write()
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
  getActivationTx() {
    db.get('activationTx').value()
  },
  setActivationTx(hash) {
    db.set('activationTx', hash).write()
  },
  clearActivationTx(hash) {
    db.set('activationTx', hash).write()
  },
}
