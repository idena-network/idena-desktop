/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const {spawn, exec} = require('child_process')
const axios = require('axios')
const progress = require('progress-stream')
const semver = require('semver')

const idenaBin = 'idena-go'
const idenaNodeReleasesUrl =
  'https://api.github.com/repos/idena-network/idena-go/releases/latest'

const nodeVersionRegex = /\d+.\d+.\d+/

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

const getNodeDir = () => path.join(__dirname, 'node')

const getNodeFile = () => path.join(getNodeDir(), idenaBin + getBinarySuffix())

const getTempNodeFile = () =>
  path.join(getNodeDir(), `new-${idenaBin}${getBinarySuffix()}`)

const isBundled = () => fs.existsSync(getNodeFile())

const getBinary = async () => (isBundled() ? getNodeFile() : idenaBin)

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
        onProgress(p)
      })

      response.data.pipe(str).pipe(writer)
    } catch (error) {
      reject(error)
    }
  })
}

async function startNode(port, useLogging = true, onLog) {
  const idenaNode = spawn(await getBinary(), ['--rpcport', port])

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
    node.on('close', resolve)
    node.kill()
  })
}

function getCurrentVersion(tempNode) {
  return new Promise((resolve, reject) => {
    const node = tempNode ? getTempNodeFile() : getNodeFile()
    exec(`${node} --version`, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr))
      }

      const m = stdout.match(nodeVersionRegex)
      if (m && m.length && semver.valid(m[0])) {
        resolve(semver.clean(m[0]))
      }

      reject(new Error('cannot resolve node version'))
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
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = {
  downloadNode,
  getCurrentVersion,
  getRemoteVersion,
  startNode,
  stopNode,
  updateNode,
}
