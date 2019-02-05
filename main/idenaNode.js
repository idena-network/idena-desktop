const path = require('path')
const fs = require('fs')
const {spawn} = require('child_process')

const channels = require('./channels')

const IDENA_NODE_BIN = 'idena-go'

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

const getFile = () =>
  path.join(__dirname, '..', IDENA_NODE_BIN + getBinarySuffix())

const isBundled = () => fs.existsSync(getFile())

const getBinary = async () => (isBundled() ? getFile() : IDENA_NODE_BIN)

module.exports.startNode = async (
  window,
  topic = channels.node,
  useLogging = true
) => {
  const idenaNode = spawn(await getBinary())

  idenaNode.stdout.on('data', data => {
    if (useLogging) {
      console.log(`stdout: ${data}`)
    }
    window.webContents.send(topic, {
      status: 'off',
      log: data,
    })
  })

  idenaNode.stderr.on('data', data => {
    if (useLogging) {
      console.error(`stderr: ${data}`)
    }
    window.webContents.send(topic, {
      status: 'off',
      log: data,
    })
  })

  idenaNode.on('close', code => {
    if (useLogging) {
      console.info(`child process exited with code ${code}`)
    }
  })
}
