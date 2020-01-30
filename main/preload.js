// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron')

const {
  clipboard,
  ipcRenderer,
  remote: {app},
  shell,
} = electron

const isDev = require('electron-is-dev')

const flips = require('./stores/flips')
const validation = require('./stores/validation')
const invites = require('./stores/invites')
const contacts = require('./stores/contacts')
const logger = require('./logger')
const {prepareDb, checkDbExists} = require('./stores/setup')
const {loadKeyword} = require('./utils/keywords')

const isFirstRun = !checkDbExists('settings')

process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer
  global.openExternal = shell.openExternal

  global.flipStore = flips
  global.validationDb = validation
  global.invitesDb = invites
  global.contactsDb = contacts

  global.loadKeyword = loadKeyword

  global.logger = logger

  global.isDev = isDev
  global.prepareDb = prepareDb
  global.isMac = process.platform === 'darwin'

  global.clipboard = clipboard
  global.isFirstRun = isFirstRun
  ;[global.locale] = app.getLocale().split('-')

  global.appVersion = app.getVersion()

  if (isDev) {
    global.require = require
    // eslint-disable-next-line no-underscore-dangle
    global.__devtron = {require, process}
  }
})
