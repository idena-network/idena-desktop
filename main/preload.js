const {ipcRenderer} = require('electron')
const isDev = require('electron-is-dev')

const flips = require('./flips')

// Since we disabled nodeIntegration we can reintroduce
// needed node functionality here
process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer
  global.flips = flips

  if (isDev) {
    global.require = require
    // eslint-disable-next-line no-underscore-dangle
    window.__devtron = {require, process}
  }
})
