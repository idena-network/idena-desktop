// Native
const {join, resolve} = require('path')
const {format} = require('url')
// const sharp = require('sharp')

// Packages
const {BrowserWindow, app, ipcMain, Tray, Menu} = require('electron')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')

const channels = require('./channels')
const {startNode} = require('./idenaNode')

let mainWindow
let tray

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

ipcMain.on(channels.compressFlipSource, (ev, message) => {
  // sharp(message)
  //   // .resize(300)
  //   .jpeg({
  //     quality: 50,
  //     progressive: true,
  //     trellisQuantisation: true,
  //     quantizationTable: 5,
  //   })
  //   .toBuffer()
  //   .then(data => ev.sender.send(channels.compressFlipSource, data))
  //   .catch(err => {
  //     // eslint-disable-next-line no-console
  //     console.error(err)
  //     throw new Error(err)
  //   })
})
