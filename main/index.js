// Native
const {join} = require('path')
const {format} = require('url')

// Packages
const {BrowserWindow, app, ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')

const channels = require('./channels')
const {startNode} = require('./idenaNode')

let mainWindow

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
  })

  const devPath = 'http://localhost:8000/start'

  const prodPath = format({
    pathname: join(__dirname, '../renderer/start/index.html'),
    protocol: 'file:',
    slashes: true,
  })

  const url = isDev ? devPath : prodPath

  mainWindow.loadURL(url)
})

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit)

// listen specific `node` messages
ipcMain.on(channels.node, (event, message) => {
  if (message === 'start') {
    startNode(mainWindow)
    return
  }
  event.sender.send(channels.node, message)
})
