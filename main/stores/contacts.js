const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const nanoid = require('nanoid')

const adapter = new FileSync('contacts.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({contacts: []}).write()

function getContacts() {
  return db.get('contacts')
}

module.exports = {
  getContacts() {
    return getContacts().value()
  },
  getContact(id) {
    return getContacts()
      .find({id})
      .read()
  },
  addContact(contact) {
    return getContacts()
      .push({id: nanoid(), ...contact})
      .write()
  },
  removeContact(id) {
    return getContacts()
      .remove({id})
      .write()
  },
}
