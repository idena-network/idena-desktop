/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
const {spawn} = require('child_process')

const idenaBin = 'idena-go'

const getBinarySuffix = () => (process.platform === 'win32' ? '.exe' : '')

const getFile = () => path.join(__dirname, '..', idenaBin + getBinarySuffix())

const isBundled = () => fs.existsSync(getFile())

const getBinary = async () => (isBundled() ? getFile() : idenaBin)

module.exports.startNode = async (sender, useLogging = true) => {
  const idenaNode = spawn(await getBinary())

  idenaNode.stdout.on('data', data => {
    sender.send('node-log', {
      status: 'off',
      log: data,
    })
    if (useLogging) {
      console.log(data)
    }
  })

  idenaNode.stderr.on('data', err => {
    sender.send('node-error', {
      status: 'off',
      log: err,
    })
    if (useLogging) {
      console.error(err)
    }
  })

  idenaNode.on('node-close', code => {
    if (useLogging) {
      console.info(`child process exited with code ${code}`)
    }
  })
}
