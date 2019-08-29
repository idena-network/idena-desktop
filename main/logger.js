const {app, remote} = require('electron')
const path = require('path')
const pino = require('pino')

function logPath(fileName) {
  return path.join((app || remote.app).getPath('logs'), fileName)
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
