const {app, remote} = require('electron')
const path = require('path')
const fs = require('fs')
const pino = require('pino')

function logPath(fileName) {
  const whichApp = app || remote.app
  const dir = path.join(whichApp.getPath('userData'), 'logs')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  return path.join(dir, fileName)
}

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    redact: [
      'hex',
      'data[*].hex',
      'flips[*].hex',
      'flips[*].pics',
      'flips[*].urls',
    ],
  },
  logPath('idena.log')
)

module.exports = logger
