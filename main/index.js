const {join, resolve} = require('path')
const {format} = require('url')
const {BrowserWindow, app, ipcMain, Tray, Menu} = require('electron')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')
const express = require('express')

const {IMAGE_SEARCH_TOGGLE, IMAGE_SEARCH_PICK} = require('./channels')
const {startNode} = require('./idenaNode')

let mainWindow
let tray

// Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const isWin = process.platform === 'win32'

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
    icon: resolve(__dirname, 'static', '64x64.png'),
  })

  const devPath = 'http://localhost:8000/start'

  const prodPath = format({
    pathname: join(__dirname, '../renderer/start/index.html'),
    protocol: 'file:',
    slashes: true,
  })

  const url = isDev ? devPath : prodPath

  mainWindow.loadURL(url)

  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: 'detach',
    })
  }

  mainWindow.on('close', e => {
    if (mainWindow.forceClose) {
      return
    }
    e.preventDefault()
    mainWindow.hide()
  })
}

const createTray = () => {
  tray = new Tray(resolve(__dirname, 'static', 'tray', 'icon-dark-2.png'))

  if (isWin) {
    tray.on('click', showMainWindow)
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Idena',
      click: showMainWindow,
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:',
    },
  ])
  tray.setContextMenu(contextMenu)
}

const showMainWindow = () => {
  mainWindow.show()
  mainWindow.focus()
}

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  createMainWindow()
  createTray()
})

app.on('before-quit', () => {
  mainWindow.forceClose = true
})

app.on('activate', showMainWindow)

// Quit the app once all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('node-start', ({sender}) => {
  startNode(sender, false)
})

// listen specific `node` messages
ipcMain.on('node-log', ({sender}, message) => {
  sender.send('node-log', message)
})

const server = express()
server.get('/', (_, res) => {
  res.sendFile(resolve(__dirname, './server.html'))
})

server.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Running on localhost:3000')
})

let searchWindow
ipcMain.on(IMAGE_SEARCH_TOGGLE, (event, message) => {
  if (message) {
    searchWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        preload: join(__dirname, 'preload.js'),
      },
    })
    searchWindow.setParentWindow(mainWindow)
    searchWindow.loadURL('http://localhost:3000/')
    if (isDev && false) {
      searchWindow.webContents.openDevTools({
        mode: 'detach',
      })
    }
  }
})
ipcMain.on(IMAGE_SEARCH_TOGGLE, (event, message) => {
  if (!message) {
    searchWindow.close()
  }
})
ipcMain.on(IMAGE_SEARCH_PICK, (event, message) => {
  mainWindow.webContents.send(IMAGE_SEARCH_PICK, message)
})
