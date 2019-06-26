// eslint-disable-next-line import/no-extraneous-dependencies
const {ipcRenderer} = require('electron')
const isDev = require('electron-is-dev')

const flips = require('./stores/flips')
const validation = require('./stores/validation')
const invites = require('./stores/invites')
const contacts = require('./stores/contacts')

process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer
  global.flipStore = flips
  global.validationStore = validation
  global.invitesDb = invites
  global.contactsDb = contacts

  if (isDev) {
    global.require = require
    // eslint-disable-next-line no-underscore-dangle
    global.__devtron = {require, process}
  }
})
