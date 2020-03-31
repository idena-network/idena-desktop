const {platform, getSystemVersion} = require('process')
const path = require('path')
const pino = require('pino')

const appDataPath = require('./app-data-path')

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'debug',
    base: {pid: process.pid, os: `${platform} ${getSystemVersion()}`},
    redact: [
      'hex',
      'data[*].hex',
      'flips[*].hex',
      'flips[*].publicHex',
      'flips[*].privateHex',
      'flips[*].pics',
      'flips[*].urls',
      'context.shortFlips[*].hex',
      'context.longFlips[*].hex',
      'context.shortFlips[*].publicHex',
      'context.longFlips[*].publicHex',
      'context.shortFlips[*].privateHex',
      'context.longFlips[*].privateHex',
      'context.shortFlips[*].images',
      'context.longFlips[*].images',
    ],
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  },
  path.join(appDataPath('logs'), 'idena.log')
)

module.exports = logger
