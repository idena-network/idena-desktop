const path = require('path')
const fs = require('fs')
const {spawn} = require('child_process')

const channels = require('./channels')

const idenaBin = 'idena-go'

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

const getFile = () => path.join(__dirname, '..', idenaBin + getBinarySuffix())

const isBundled = () => fs.existsSync(getFile())

const getBinary = async () => (isBundled() ? getFile() : idenaBin)

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
