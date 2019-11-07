const {join, resolve} = require('path')
const {
  BrowserWindow,
  app,
  ipcMain,
  Tray,
  Menu,
  systemPreferences,
  // eslint-disable-next-line import/no-extraneous-dependencies
} = require('electron')
const {autoUpdater} = require('electron-updater')
const isDev = require('electron-is-dev')
const prepareNext = require('electron-next')
const express = require('express')
const net = require('net')
const loadRoute = require('./utils/routes')
const logger = require('./logger')

logger.info('idena started', global.appVersion || app.getVersion())

// autoUpdater.logger = logger
// autoUpdater.logger.transports.file.level = 'info'

const {
  IMAGE_SEARCH_TOGGLE,
  IMAGE_SEARCH_PICK,
  UI_UPDATE_EVENT,
  UI_UPDATE_COMMAND,
  NODE_COMMAND,
  NODE_EVENT,
} = require('./channels')
const {
  startNode,
  stopNode,
  downloadNode,
  updateNode,
  getCurrentVersion,
  getRemoteVersion,
} = require('./idenaNode')

let mainWindow
let node
let tray
let expressPort = 3051

// Possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'

app.on('second-instance', () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})
const isFirstInstance = app.requestSingleInstanceLock()

if (!isFirstInstance) {
  app.quit()
  return
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: app.getName(),
    width: 1080,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
    icon: resolve(__dirname, 'static', 'icon-128@2x.png'),
  })

  loadRoute(mainWindow, 'dashboard')

  mainWindow.on('close', e => {
    if (mainWindow.forceClose) {
      return
    }
    e.preventDefault()
    mainWindow.hide()
  })
}

const showMainWindow = () => {
  mainWindow.show()
  mainWindow.focus()
}

const createMenu = () => {
  const application = {
    label: 'Idena',
    submenu: [
      {
        label: 'About Idena',
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: 'Dev tools',
        accelerator:
          process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
        role: 'toggleDevTools',
        visible: false,
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        selector: 'terminate:',
        click: () => {
          app.quit()
        },
      },
    ],
  }

  const edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll',
      },
    ],
  }

  const template = [application, edit]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function trayIcon() {
  const icon = 'icon-16-white@2x.png'
  return isMac
    ? `icon-16${systemPreferences.isDarkMode() ? '-white' : ''}@2x.png`
    : icon
}

if (isMac) {
  systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    () => {
      tray.setImage(resolve(__dirname, 'static', 'tray', trayIcon()))
    }
  )
}

const createTray = () => {
  tray = new Tray(resolve(__dirname, 'static', 'tray', trayIcon()))

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
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
}

autoUpdater.on('download-progress', info => {
  mainWindow.webContents.send(UI_UPDATE_EVENT, 'download-progress', info)
})

autoUpdater.on('update-downloaded', info => {
  mainWindow.webContents.send(UI_UPDATE_EVENT, 'update-ready', info)
})

function checkForUpdates() {
  if (isDev) {
    return
  }

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60 * 60 * 1000)

  autoUpdater.checkForUpdates()
}

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer')

  createMainWindow()
  if (!isDev) {
    createMenu()
  }
  createTray()

  if (isWin) {
    checkForUpdates()
  }
  setTimeout(pollRemoteVersion, 10000)
})

app.on('before-quit', () => {
  mainWindow.forceClose = true
})

app.on('activate', showMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on(NODE_COMMAND, async (event, command, data) => {
  console.log('new command', command)

  switch (command) {
    case 'init-local-node': {
      getCurrentVersion()
        .then(version => {
          mainWindow.webContents.send(NODE_EVENT, 'node-ready', version)
        })
        .catch(async e => {
          logger.error('error while getting node version', e.toString())
          const remoteVersion = await getRemoteVersion()
          mainWindow.webContents.send(
            NODE_EVENT,
            'download-started',
            remoteVersion
          )
          downloadNode(progress => {
            mainWindow.webContents.send(
              NODE_EVENT,
              'download-progress',
              progress
            )
          })
            .then(async version => {
              mainWindow.webContents.send(
                NODE_EVENT,
                'download-finished',
                version
              )
              try {
                await updateNode()
                mainWindow.webContents.send(NODE_EVENT, 'node-ready', version)
              } catch (err) {
                mainWindow.webContents.send(NODE_EVENT, 'init-failed')
                logger.error('error while updating node', err.toString())
              }
            })
            .catch(err => {
              mainWindow.webContents.send(NODE_EVENT, 'init-failed')
              logger.error('error while downlading node', err.toString())
            })
        })
      break
    }
    case 'start-local-node': {
      startNode(data.rpcPort, false, log => {
        mainWindow.webContents.send(NODE_EVENT, 'node-log', log)
      })
        .then(n => {
          node = n
          mainWindow.webContents.send(NODE_EVENT, 'node-start')
        })
        .catch(e => {
          mainWindow.webContents.send(NODE_EVENT, 'node-start-fail')
          logger.error('error while starting node', e.toString())
        })
      break
    }
    case 'stop-local-node': {
      stopNode(node)
        .then(() => {
          mainWindow.webContents.send(NODE_EVENT, 'node-stop')
        })
        .catch(e => {
          mainWindow.webContents.send(NODE_EVENT, 'node-stop-fail')
          logger.error('error while stopping node', e.toString())
        })
      break
    }
    case 'update-local-node': {
      stopNode(node)
        .then(async () => {
          try {
            mainWindow.webContents.send(NODE_EVENT, 'node-stop')
            await updateNode()
            const version = await getCurrentVersion(false)
            mainWindow.webContents.send(NODE_EVENT, 'node-ready', version)
          } catch (e) {
            mainWindow.webContents.send(NODE_EVENT, 'init-failed')
          }
        })
        .catch(e => {
          mainWindow.webContents.send(NODE_EVENT, 'node-stop-fail')
          logger.error('error while stopping node', e.toString())
        })
      break
    }
    case 'download-update': {
      downloadNode(progress => {
        mainWindow.webContents.send(NODE_EVENT, 'download-progress', progress)
      })
        .then(version => {
          mainWindow.webContents.send(NODE_EVENT, 'download-finished', version)
        })
        .catch(e => {
          mainWindow.webContents.send(NODE_EVENT, 'download-failed')
          logger.error('error while downlading node', e.toString())
        })
      break
    }
    default:
  }
})

// listen specific `node` messages
ipcMain.on('node-log', ({sender}, message) => {
  sender.send('node-log', message)
})

function checkPort(port) {
  logger.debug('Looking for open port...', port)
  return new Promise((res, rej) => {
    const tempServer = net.createServer()

    tempServer.once('error', () => {
      rej()
    })

    tempServer.once('listening', () => {
      tempServer.close()
      res()
    })

    tempServer.listen(port)
  })
}

function runExpress(port) {
  const server = express()
  server.get('/', (_, res) => {
    res.sendFile(resolve(__dirname, './server.html'))
  })

  server.listen(port, () => {
    logger.debug(`Running on localhost:${port}`)
  })
}

function choosePort() {
  return checkPort(expressPort)
    .then(() => {
      logger.debug(`Found open port: ${expressPort}`)
      runExpress(expressPort)
      return Promise.resolve()
    })
    .catch(() => {
      expressPort += 1
      return choosePort()
    })
}

choosePort()

let searchWindow
ipcMain.on(IMAGE_SEARCH_TOGGLE, (_event, message) => {
  if (message) {
    searchWindow = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        preload: join(__dirname, 'preload.js'),
      },
      parent: mainWindow,
    })
    searchWindow.loadURL(`http://localhost:${expressPort}/`)
  }
})

ipcMain.on(IMAGE_SEARCH_TOGGLE, (_event, message) => {
  if (!message) {
    searchWindow.close()
  }
})

ipcMain.on(IMAGE_SEARCH_PICK, (_event, message) => {
  mainWindow.webContents.send(IMAGE_SEARCH_PICK, message)
})

ipcMain.on(UI_UPDATE_COMMAND, async (event, command) => {
  if (command === 'update-ui') {
    autoUpdater.quitAndInstall()
  }
})

ipcMain.on('reload', () => {
  loadRoute(mainWindow, 'dashboard')
})

async function pollRemoteVersion() {
  try {
    const remoteVersion = await getRemoteVersion()
    mainWindow.webContents.send(NODE_EVENT, 'remote-version', remoteVersion)
  } catch (e) {
    logger.error('error while checking remote node version', e.toString())
  }

  setTimeout(pollRemoteVersion, 60 * 1000)
}
