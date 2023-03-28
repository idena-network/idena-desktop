/* eslint-disable no-console */
const path = require('path')
const fs = require('fs-extra')
const {spawn} = require('child_process')
const axios = require('axios')
const progress = require('progress-stream')
const semver = require('semver')
const kill = require('tree-kill')
const lineReader = require('reverse-line-reader')
// eslint-disable-next-line import/no-extraneous-dependencies
const appDataPath = require('./app-data-path')
const logger = require('./logger')

const idenaBin = 'idena-go'
const idenaNodeReleasesUrl =
  'https://api.github.com/repos/idena-network/idena-go/releases/latest'
const idenaChainDbFolder = 'idenachain.db'

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

const getNodeDir = () => path.join(appDataPath('userData'), 'node')

const getNodeDataDir = () => path.join(getNodeDir(), 'datadir')

const getNodeFile = () => path.join(getNodeDir(), idenaBin + getBinarySuffix())

const getNodeConfigFile = () => path.join(getNodeDir(), 'config.json')

const getTempNodeFile = () =>
  path.join(getNodeDir(), `new-${idenaBin}${getBinarySuffix()}`)

const getNodeChainDbFolder = () =>
  path.join(getNodeDataDir(), idenaChainDbFolder)

const getNodeIpfsDir = () => path.join(getNodeDataDir(), 'ipfs')

const getNodeLogsFile = () => path.join(getNodeDataDir(), 'logs', 'output.log')

const getNodeErrorFile = () => path.join(getNodeDataDir(), 'logs', 'error.log')

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

  const asset = data.assets.filter((x) => x.name.startsWith(assetName))

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
  // eslint-disable-next-line no-async-promise-executor
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

      str.on('progress', (p) => {
        onProgress({...p, version})
      })

      response.data.pipe(str).pipe(writer)
    } catch (error) {
      reject(error)
    }
  })
}

function writeError(err) {
  try {
    fs.appendFileSync(
      getNodeErrorFile(),
      `-- node error, time: ${new Date().toUTCString()} --\n${err}\n -- end of error -- \n`
    )
  } catch (e) {
    console.log(`cannot write error to file: ${e.toString()}`)
  }
}

async function startNode(
  port,
  tcpPort,
  ipfsPort,
  apiKey,
  autoActivateMining,
  // eslint-disable-next-line default-param-last
  useLogging = true,
  onLog,
  onExit
) {
  const parameters = [
    '--datadir',
    getNodeDataDir(),
    '--rpcport',
    port,
    '--port',
    tcpPort,
    '--ipfsport',
    ipfsPort,
    '--apikey',
    apiKey,
  ]

  const version = await getCurrentVersion(false)

  if (autoActivateMining && semver.gt(version, '0.28.3')) {
    parameters.push('--autoonline')
  }

  const configFile = getNodeConfigFile()
  if (fs.existsSync(configFile)) {
    parameters.push('--config')
    parameters.push(configFile)
  }

  const idenaNode = spawn(getNodeFile(), parameters)

  idenaNode.stdout.on('data', (data) => {
    const str = data.toString()
    if (onLog) onLog(str.split('\n').filter((x) => x))
    if (useLogging) {
      console.log(str)
    }
  })

  idenaNode.stderr.on('data', (err) => {
    const str = err.toString()
    writeError(str)
    if (onLog) onLog(str.split('\n').filter((x) => x))
    if (useLogging) {
      console.error(str)
    }
  })

  idenaNode.on('exit', (code) => {
    if (useLogging) {
      console.info(`child process exited with code ${code}`)
    }
    if (onExit) {
      onExit(`node stopped with code ${code}`, code)
    }
  })

  return idenaNode
}

async function stopNode(node) {
  return new Promise((resolve, reject) => {
    try {
      if (!node) {
        resolve('node process not found')
      }
      if (node.exitCode != null) {
        resolve(`node already exited with code ${node.exitCode}`)
      }
      if (process.platform !== 'win32') {
        kill(node.pid, 'SIGINT', (err) => {
          if (err) {
            return reject(err)
          }
          return resolve(`node ${node.pid} stopped successfully`)
        })
      } else {
        node.on('exit', () => resolve(`node ${node.pid} stopped successfully`))
        node.on('error', reject)
        node.kill()
      }
    } catch (e) {
      reject(e)
    }
  })
}

function getCurrentVersion(tempNode) {
  return new Promise((resolve, reject) => {
    const node = tempNode ? getTempNodeFile() : getNodeFile()

    try {
      const nodeVersion = spawn(node, ['--version'])
      nodeVersion.stdout.on('data', (data) => {
        const {version} = semver.coerce(data.toString())
        return semver.valid(version)
          ? resolve(version)
          : reject(
              new Error(
                `cannot resolve node version, stdout: ${data.toString()}`
              )
            )
      })

      nodeVersion.stderr.on('data', (data) =>
        reject(
          new Error(`cannot resolve node version, stderr: ${data.toString()}`)
        )
      )

      nodeVersion.on('exit', (code) => {
        if (code) {
          return reject(
            new Error(`cannot resolve node version, exit code ${code}`)
          )
        }
      })

      nodeVersion.on('error', (err) => reject(err))
    } catch (e) {
      reject(e)
    }
  })
}

function updateNode() {
  return new Promise((resolve, reject) => {
    try {
      const currentNode = getNodeFile()
      const tempNode = getTempNodeFile()
      let num = 5
      let done = false
      while (num > 0) {
        try {
          if (fs.existsSync(currentNode)) {
            fs.unlinkSync(currentNode)
          }
          done = true
        } catch (e) {
          console.error('error checking current node')
        } finally {
          num -= 1
        }
      }
      if (!done) {
        reject(new Error('cannot remove old idena-go file'))
      }

      fs.renameSync(tempNode, currentNode)
      if (process.platform !== 'win32') {
        fs.chmodSync(currentNode, '755')
      }
      resolve()
    } catch (e) {
      reject(e)
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

function getLastLogs() {
  const number = 100
  return new Promise((resolve, reject) => {
    try {
      const logs = []
      lineReader.eachLine(getNodeLogsFile(), (line, last) => {
        logs.push(line)
        if (logs.length === number || last) {
          resolve(logs.reverse())
          return false
        }
        return true
      })
    } catch (e) {
      reject(e)
    }
  })
}

async function tryStopNode(node, {onSuccess, onFail}) {
  try {
    if (node) {
      const log = await stopNode(node)
      logger.info(log)
      if (onSuccess) {
        onSuccess()
      }
    }
  } catch (e) {
    logger.error('error while stopping node', e.toString())
    if (onFail) {
      onFail()
    }
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
  getLastLogs,
  getNodeFile,
  getNodeChainDbFolder,
  getNodeIpfsDir,
  tryStopNode,
}
