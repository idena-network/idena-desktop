/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const {app, remote} = require('electron')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fs = require('fs')

function dbPath(fileDb) {
  const whichApp = app || remote.app
  return path.join(whichApp.getPath('userData'), fileDb)
}

module.exports = {
  dbPath,
  prepareDb(name) {
    const adapter = new FileSync(dbPath(`${name}.json`))
    return low(adapter)
  },
  checkDbExists(name) {
    return fs.existsSync(dbPath(`${name}.json`))
  },
}
