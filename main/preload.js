const {ipcRenderer} = require('electron')
const isDev = require('electron-is-dev')

const flips = require('./utils/flips')
const validation = require('./utils/validation')

process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer
  global.flips = flips
  global.validationStore = validation

  if (isDev) {
    global.require = require
    // eslint-disable-next-line no-underscore-dangle
    global.__devtron = {require, process}
  }
})
