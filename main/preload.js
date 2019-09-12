// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron')
const isDev = require('electron-is-dev')

const flips = require('./stores/flips')
const validation = require('./stores/validation')
const invites = require('./stores/invites')
const contacts = require('./stores/contacts')
const logger = require('./logger')
const {prepareDb} = require('./stores/setup')

process.once('loaded', () => {
  global.ipcRenderer = electron.ipcRenderer
  global.flipStore = flips
  // global.validationStore = validation
  global.validationDb = validation
  global.invitesDb = invites
  global.contactsDb = contacts

  global.logger = logger

  global.isDev = isDev
  global.prepareDb = prepareDb

  try {
    global.appVersion = electron.remote.app.getVersion()
  } catch (error) {
    console.error(error)
  }

  if (isDev) {
    global.require = require
    // eslint-disable-next-line no-underscore-dangle
    global.__devtron = {require, process}
  }
})
