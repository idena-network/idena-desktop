const {ipcRenderer} = require('electron')

// Since we disabled nodeIntegration we can reintroduce
// needed node functionality here
process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer
  global.require = require
  // eslint-disable-next-line no-underscore-dangle
  window.__devtron = {require, process}
})
