const events = require('events')
const semver = require('semver')
const {
  downloadNode,
  getRemoteVersion,
  nodeExists,
  getCurrentVersion,
} = require('./idena-node')

class NodeUpdater extends events.EventEmitter {
  constructor(logger) {
    super()

    this.logger = logger
    this.timeout = 0
  }

  async checkForUpdates(currentVersion, isInternalNode) {
    this.logger.info(
      `start checking updates, internal node: ${isInternalNode}, current version: ${currentVersion}`
    )
    this.currentVersion = currentVersion
    this.isInternalNode = isInternalNode

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    return this.doUpdateCheck()
  }

  async doUpdateCheck() {
    try {
      const remoteVersion = await getRemoteVersion()
      if (this.isInternalNode && !nodeExists()) {
        return false
      }
      if (semver.lt(this.currentVersion, remoteVersion)) {
        this.emit('update-available', {version: remoteVersion})

        if (this.isInternalNode) {
          if (!this.downloadPromise) {
            getCurrentVersion(true)
              .then(version => {
                if (semver.lt(version, remoteVersion)) {
                  this.downloadNode(remoteVersion)
                } else {
                  this.emit('update-downloaded', {version})
                }
              })
              .catch(() => this.downloadNode(remoteVersion))
          }
        }

        return true
      }
    } catch (e) {
      this.logger.error('error while checking update', e.toString())
    } finally {
      this.timeout = setTimeout(() => this.doUpdateCheck(), 60 * 60 * 1000)
    }

    return false
  }

  async downloadNode(remoteVersion) {
    if (this.downloadPromise) return
    this.downloadPromise = downloadNode(progress => {
      this.emit('download-progress', progress)
    })
      .then(() => {
        this.downloadPromise = null
        this.emit('update-downloaded', {version: remoteVersion})
      })
      .catch(e => {
        this.downloadPromise = null
        this.logger.error('error while downloading update', e.toString())
        this.emit('update-failed')
      })
  }
}

module.exports = NodeUpdater
