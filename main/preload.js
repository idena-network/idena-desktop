// eslint-disable-next-line import/no-extraneous-dependencies
const {ipcRenderer} = require('electron')
const isDev = require('electron-is-dev')

const flips = require('./stores/flips')
const validation = require('./stores/validation')
const invite = require('./stores/invite')

process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer
  global.flipStore = flips
  global.validationStore = validation
  global.inviteDb = invite

  if (isDev) {
    global.require = require
    // eslint-disable-next-line no-underscore-dangle
    global.__devtron = {require, process}
  }
})
