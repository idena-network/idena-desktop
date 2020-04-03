const {persistZoomLevel} = require('./stores/settings')

function promiseTimeout(ms, promise) {
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      return reject(new Error(`Timed out in ${ms}ms.`))
    }, ms)
  })

  return Promise.race([promise, timeout])
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  promiseTimeout,
  sleep,
  zoomIn(window) {
    const nextLevel = window.webContents.zoomLevel + 1
    window.webContents.zoomLevel = nextLevel
    persistZoomLevel(nextLevel)
  },
  zoomOut(window) {
    const nextLevel = window.webContents.zoomLevel - 1
    window.webContents.zoomLevel = nextLevel
    persistZoomLevel(nextLevel)
  },
  resetZoom(window) {
    window.webContents.zoomLevel = 0
    persistZoomLevel(0)
  },
}
