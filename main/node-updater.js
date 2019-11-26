const events = require('events')
const semver = require('semver')
const {
  downloadNode,
  getRemoteVersion,
  nodeExists,
  getCurrentVersion,
} = require('./idena-node')

const checkingInterval = 10 * 60 * 1000

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
      this.logger.info(
        'do update check',
        'current',
        this.currentVersion,
        'isInternal',
        this.isInternalNode
      )
      const remoteVersion = await getRemoteVersion()
      if (this.isInternalNode && !nodeExists()) {
        this.logger.info('node does not exist, return')
        return false
      }

      this.logger.info('got remote version', remoteVersion)

      if (semver.lt(this.currentVersion, remoteVersion)) {
        this.logger.info('update available')
        this.emit('update-available', {version: remoteVersion})

        if (this.isInternalNode) {
          this.logger.info('got remote version', remoteVersion)

          if (!this.downloadPromise) {
            this.logger.info('getting current temp version')
            getCurrentVersion(true)
              .then(version => {
                this.logger.info('got local temp version', version)
                if (semver.lt(version, remoteVersion)) {
                  this.downloadNode(remoteVersion)
                } else {
                  this.emit('update-downloaded', {version})
                }
              })
              .catch(() => this.downloadNode(remoteVersion))
          } else {
            this.logger.info('download promise is not null, skip downloading')
          }
        }

        return true
      }
    } catch (e) {
      this.logger.error('error while checking update', e.toString())
    } finally {
      this.timeout = setTimeout(() => this.doUpdateCheck(), checkingInterval)
    }

    return false
  }

  async downloadNode(remoteVersion) {
    this.logger.info(
      'start download',
      remoteVersion,
      'promise',
      !!this.downloadPromise
    )
    if (this.downloadPromise) return
    this.downloadPromise = downloadNode(progress => {
      this.logger.info('download progress', progress)
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
