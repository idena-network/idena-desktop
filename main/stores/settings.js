const {prepareDb} = require('../stores/setup')

module.exports = {
  persistZoomLevel(level) {
    prepareDb('settings')
      .set('zoomLevel', level)
      .write()
  },
}
