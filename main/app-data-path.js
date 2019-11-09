/* eslint-disable prefer-rest-params */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const {app, remote} = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const homeDir = os.homedir ? os.homedir() : process.env.HOME

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

function prepareDir(dirPath) {
  if (!this || this.or !== prepareDir || !this.result) {
    if (!dirPath) {
      return {or: prepareDir}
    }

    // eslint-disable-next-line prefer-spread
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

function appDataPath(folder) {
  const whichApp = app || remote.app

  switch (process.platform) {
    case 'darwin':
    case 'win32':
      return whichApp.getPath(folder)
    default:
      return prepareDir(whichApp.getPath('userData'))
        .or(process.env.XDG_CONFIG_HOME)
        .or(homeDir, '.config')
        .or(process.env.XDG_DATA_HOME)
        .or(homeDir, '.local', 'share').result
  }
}

module.exports = appDataPath
