/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const {app, remote} = require('electron')

function dbPath(fileDb) {
  const whichApp = app || remote.app
  return path.join(whichApp.getPath('userData'), fileDb)
}

module.exports = {
  dbPath,
}
