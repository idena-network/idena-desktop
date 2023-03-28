const {prepareDb} = require('./setup')

module.exports = {
  persistZoomLevel(level) {
    prepareDb('settings').set('zoomLevel', level).write()
  },
}
