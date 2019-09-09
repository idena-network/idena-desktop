const {app, remote} = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const pino = require('pino')

const homeDir = os.homedir ? os.homedir() : process.env.HOME

function logPath(fileName) {
  const whichApp = app || remote.app

  switch (process.platform) {
    case 'darwin':
    case 'win32':
      return path.join(whichApp.getPath('logs'), fileName)
    default:
      return path.join(
        prepareDir(whichApp.getPath('userData'))
          .or(process.env.XDG_CONFIG_HOME)
          .or(homeDir, '.config')
          .or(process.env.XDG_DATA_HOME)
          .or(homeDir, '.local', 'share').result,
        fileName
      )
  }
}

function prepareDir(dirPath) {
  if (!this || this.or !== prepareDir || !this.result) {
    if (!dirPath) {
      return {or: prepareDir}
    }

    dirPath = path.join.apply(path, arguments)
    mkDir(dirPath)

    try {
      fs.accessSync(dirPath, fs.W_OK)
    } catch (e) {
      return {or: prepareDir}
    }
  }

  return {
    or: prepareDir,
    result: (this ? this.result : false) || dirPath,
  }
}

function mkDir(dirPath, root) {
  const dirs = dirPath.split(path.sep)
  const dir = dirs.shift()
  root = (root || '') + dir + path.sep

  try {
    fs.mkdirSync(root)
  } catch (e) {
    if (!fs.statSync(root).isDirectory()) {
      throw new Error(e)
    }
  }

  return !dirs.length || mkDir(dirs.join(path.sep), root)
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
