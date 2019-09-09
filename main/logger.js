const {app, remote} = require('electron')
const path = require('path')
const pino = require('pino')

function logPath(fileName) {
  const whichApp = app || remote.app

  switch (process.platform) {
    case 'darwin':
    case 'win32':
      return path.join(whichApp.getPath('logs'), fileName)
    default:
      return path.join(whichApp.getPath('userData'), fileName)
  }
}

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'debug',
    base: {pid: process.pid},
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
