const {app, remote} = require('electron')
const path = require('path')
const log4js = require('log4js')

function logPath(fileName) {
  const whichApp = app || remote.app
  return path.join(whichApp.getPath('userData'), 'logs', fileName)
}

log4js.configure({
  appenders: {
    everything: {type: 'dateFile', filename: logPath('idena.log')},
  },
  categories: {
    default: {appenders: ['everything'], level: 'debug'},
  },
})

const logger = log4js.getLogger()

module.exports = logger
module.exports.shutdown = log4js.shutdown
