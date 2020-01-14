const path = require('path')
const pino = require('pino')

const appDataPath = require('./app-data-path')

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
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  path.join(appDataPath('logs'), 'idena.log')
)

module.exports = logger
