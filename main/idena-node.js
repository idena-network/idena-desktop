/* eslint-disable no-console */
const path = require('path')
const fs = require('fs-extra')
const {spawn, exec} = require('child_process')
const axios = require('axios')
const progress = require('progress-stream')
const semver = require('semver')
// eslint-disable-next-line import/no-extraneous-dependencies
const appDataPath = require('./app-data-path')

const config = 'config.json'
const idenaBin = 'idena-go'
const idenaNodeReleasesUrl =
  'https://api.github.com/repos/idena-network/idena-go/releases/latest'
const idenaChainDbFolder = 'idenachain.db'

const nodeVersionRegex = /\d+.\d+.\d+/

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

const getNodeDir = () => path.join(appDataPath('userData'), 'node')

const getNodeDataDir = () => path.join(getNodeDir(), 'datadir')

const getNodeFile = () => path.join(getNodeDir(), idenaBin + getBinarySuffix())

const getNodeConfigFile = () => path.join(getNodeDir(), config)

const getTempNodeFile = () =>
  path.join(getNodeDir(), `new-${idenaBin}${getBinarySuffix()}`)

const getNodeChainDbFolder = () =>
  path.join(getNodeDataDir(), idenaChainDbFolder)

const getReleaseUrl = async () => {
  const {data} = await axios.get(idenaNodeReleasesUrl)
  let assetName = 'idena-node-linux'
  switch (process.platform) {
    case 'win32':
      assetName = 'idena-node-win'
      break
    case 'darwin':
      assetName = 'idena-node-mac'
      break
    default:
  }

  const asset = data.assets.filter(x => x.name.startsWith(assetName))

  return asset.length ? asset[0].browser_download_url : null
}

const getRemoteVersion = async () => {
  try {
    const {
      data: {tag_name: tag},
    } = await axios.get(idenaNodeReleasesUrl)
    return semver.clean(tag)
  } catch (e) {
    return null
  }
}

async function downloadNode(onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const url = await getReleaseUrl()
      const version = await getRemoteVersion()

      if (!fs.existsSync(getNodeDir())) {
        fs.mkdirSync(getNodeDir())
      }

      const writer = fs.createWriteStream(getTempNodeFile())
      writer.on('finish', () => writer.close(() => resolve(version)))
      writer.on('error', reject)

      const response = await axios.request({
        method: 'get',
        url,
        responseType: 'stream',
      })

      const str = progress({
        time: 1000,
        length: parseInt(response.headers['content-length'], 10),
      })

      str.on('progress', function(p) {
        onProgress({...p, version})
      })

      response.data.pipe(str).pipe(writer)
    } catch (error) {
      return reject(error)
    }
  })
}

async function startNode(port, tcpPort, ipfsPort, useLogging = true, onLog) {
  const paramters = [
    '--datadir',
    getNodeDataDir(),
    '--rpcport',
    port,
    '--port',
    tcpPort,
    '--ipfsport',
    ipfsPort,
  ]
  if (fs.existsSync(getNodeConfigFile())) {
    paramters.push('--config')
    paramters.push(config)
  }
  const idenaNode = spawn(getNodeFile(), paramters)

  idenaNode.stdout.on('data', data => {
    const str = data.toString()
    if (onLog) onLog(str)
    if (useLogging) {
      console.log(str)
    }
  })

  idenaNode.stderr.on('data', err => {
    const str = err.toString()
    if (onLog) onLog(str)
    if (useLogging) {
      console.error(str)
    }
  })

  idenaNode.on('node-close', code => {
    if (useLogging) {
      console.info(`child process exited with code ${code}`)
    }
  })

  return idenaNode
}

async function stopNode(node) {
  return new Promise(async resolve => {
    if (!node) {
      console.log('node process is not found')
      return resolve()
    }
    node.on('close', resolve)
    node.kill('SIGINT')
  })
}

function getCurrentVersion(tempNode) {
  return new Promise((resolve, reject) => {
    const node = tempNode ? getTempNodeFile() : getNodeFile()
    exec(`"${node}" --version`, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr))
      }

      const m = stdout.match(nodeVersionRegex)
      if (m && m.length && semver.valid(m[0])) {
        return resolve(semver.clean(m[0]))
      }

      return reject(new Error('cannot resolve node version'))
    })
  })
}

function updateNode() {
  return new Promise((resolve, reject) => {
    try {
      const currentNode = getNodeFile()
      const tempNode = getTempNodeFile()

      if (fs.existsSync(currentNode)) {
        fs.unlinkSync(currentNode)
      }

      fs.renameSync(tempNode, currentNode)
      if (process.platform !== 'win32') {
        fs.chmodSync(currentNode, '755')
      }
      return resolve()
    } catch (e) {
      return reject(e)
    }
  })
}

function nodeExists() {
  return fs.existsSync(getNodeFile())
}

function cleanNodeState() {
  const chainDbDirectory = getNodeChainDbFolder()
  if (fs.existsSync(chainDbDirectory)) {
    fs.removeSync(chainDbDirectory)
  }
}

module.exports = {
  downloadNode,
  getCurrentVersion,
  getRemoteVersion,
  startNode,
  stopNode,
  updateNode,
  nodeExists,
  cleanNodeState,
}
