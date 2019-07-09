const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const {dbPath} = require('./setup')

const adapter = new FileSync(dbPath('validation.json'))
const db = low(adapter)

const initialState = {shortAnswers: [], longAnswers: [], epoch: null}
db.defaults(initialState).write()

module.exports = {
  getValidation() {
    return db.getState()
  },
  getShortAnswers() {
    return db.get('shortAnswers').read()
  },
  getLongAnswers() {
    return db.get('longAnswers').read()
  },
  setShortAnswers(answers, epoch) {
    db.set('shortAnswers', answers)
      .set('epoch', epoch)
      .write()
  },
  setLongAnswers(answers, epoch) {
    return db
      .set('longAnswers', answers)
      .set('epoch', epoch)
      .write()
  },
  resetValidation() {
    db.setState(initialState).write()
  },
}
