const {join, resolve} = require('path')
const {
  BrowserWindow,
  app,
  ipcMain,
  Tray,
  Menu,
  nativeTheme,
  shell,
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

const {
  IMAGE_SEARCH_TOGGLE,
  IMAGE_SEARCH_PICK,
  AUTO_UPDATE_EVENT,
  AUTO_UPDATE_COMMAND,
  NODE_COMMAND,
  NODE_EVENT,
} = require('./channels')
const {
  startNode,
  stopNode,
  downloadNode,
  updateNode,
  getCurrentVersion,
  cleanNodeState,
  getLastLogs,
} = require('./idena-node')

const NodeUpdater = require('./node-updater')
const {persistZoomLevel} = require('./stores/settings')

let mainWindow
let node
let nodeDownloadPromise = null
let searchWindow
let tray
let expressPort = 3051

const nodeUpdater = new NodeUpdater(logger)

const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'

app.allowRendererProcessReuse = true

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
    title: app.name,
    width: 1080,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
    icon: resolve(__dirname, 'static', 'icon-128@2x.png'),
    show: false,
  })

  loadRoute(mainWindow, 'dashboard')

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', e => {
    if (mainWindow.forceClose) {
      return
    }
    e.preventDefault()
    mainWindow.hide()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const showMainWindow = () => {
  if (mainWindow) {
    mainWindow.show()
    mainWindow.focus()
  }
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
        label: 'Toggle Developer Tools',
        role: 'toggleDevTools',
        visible: false,
      },
      {
        label: 'Quit',
        accelerator: 'Cmd+Q',
        role: 'quit',
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

  const view = {
    label: 'View',
    submenu: [
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: (_, window) => {
          window.webContents.getZoomLevel(level => {
            const nextLevel = level + 1
            window.webContents.setZoomLevel(nextLevel)
            persistZoomLevel(nextLevel)
          })
        },
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: (_, window) => {
          window.webContents.getZoomLevel(level => {
            const nextLevel = level - 1
            window.webContents.setZoomLevel(nextLevel)
            persistZoomLevel(nextLevel)
          })
        },
      },
      {
        label: 'Actual Size',
        accelerator: 'CmdOrCtrl+0',
        click: (_, window) => {
          window.webContents.setZoomLevel(0)
          persistZoomLevel(0)
        },
      },
    ],
  }

  const help = {
    label: 'Help',
    submenu: [
      {
        label: 'Website',
        click: () => {
          shell.openExternal('https://idena.io/')
        },
      },
      {
        label: 'Explorer',
        click: () => {
          shell.openExternal('https://scan.idena.io/')
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Toggle Developer Tools',
        role: 'toggleDevTools',
      },
    ],
  }

  const template = [application, edit, view, help]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function trayIcon() {
  const icon = 'icon-16-white@2x.png'
  return isMac
    ? `icon-16${nativeTheme.shouldUseDarkColors ? '-white' : ''}@2x.png`
    : icon
}

if (isMac) {
  nativeTheme.on('updated', () => {
    tray.setImage(resolve(__dirname, 'static', 'tray', trayIcon()))
  })
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
      accelerator: 'Cmd+Q',
      role: 'quit',
    },
  ])
  tray.setContextMenu(contextMenu)
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
})

app.on('before-quit', () => {
  if (searchWindow && !searchWindow.isDestroyed()) {
    searchWindow.destroy()
  }
  mainWindow.forceClose = true
})

app.on('activate', showMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on(NODE_COMMAND, async (event, command, data) => {
  logger.info(`new node command`, command, data)

  switch (command) {
    case 'init-local-node': {
      getCurrentVersion()
        .then(version => {
          sendMainWindowMsg(NODE_EVENT, 'node-ready', version)
        })
        .catch(e => {
          logger.error('error while getting current node version', e.toString())
          if (nodeDownloadPromise) {
            return
          }
          nodeDownloadPromise = downloadNode(info => {
            sendMainWindowMsg(AUTO_UPDATE_EVENT, 'node-download-progress', info)
          })
            .then(() => {
              stopNode(node).then(async log => {
                logger.info(log)
                node = null
                sendMainWindowMsg(NODE_EVENT, 'node-stopped')
                await updateNode()
                sendMainWindowMsg(NODE_EVENT, 'node-ready')
              })
            })
            .catch(err => {
              sendMainWindowMsg(NODE_EVENT, 'node-failed')
              logger.error('error while downloading node', err.toString())
            })
            .finally(() => {
              nodeDownloadPromise = null
            })
        })
      break
    }
    case 'start-local-node': {
      startNode(
        data.rpcPort,
        data.tcpPort,
        data.ipfsPort,
        data.apiKey,
        isDev,
        log => {
          sendMainWindowMsg(NODE_EVENT, 'node-log', log)
        },
        (msg, code) => {
          if (code) {
            logger.error(msg)
            node = null
            sendMainWindowMsg(NODE_EVENT, 'node-failed')
          } else {
            logger.info(msg)
          }
        }
      )
        .then(n => {
          logger.info(
            `node started, PID: ${n.pid}, previous PID: ${
              node ? node.pid : 'undefined'
            }`
          )
          node = n
          sendMainWindowMsg(NODE_EVENT, 'node-started')
        })
        .catch(e => {
          sendMainWindowMsg(NODE_EVENT, 'node-failed')
          logger.error('error while starting node', e.toString())
        })
      break
    }
    case 'stop-local-node': {
      stopNode(node)
        .then(log => {
          logger.info(log)
          node = null
          sendMainWindowMsg(NODE_EVENT, 'node-stopped')
        })
        .catch(e => {
          sendMainWindowMsg(NODE_EVENT, 'node-failed')
          logger.error('error while stopping node', e.toString())
        })
      break
    }
    case 'clean-state': {
      stopNode(node)
        .then(log => {
          logger.info(log)
          node = null
          sendMainWindowMsg(NODE_EVENT, 'node-stopped')
          cleanNodeState()
          sendMainWindowMsg(NODE_EVENT, 'state-cleaned')
        })
        .catch(e => {
          sendMainWindowMsg(NODE_EVENT, 'node-failed')
          logger.error('error while stopping node', e.toString())
        })
      break
    }
    case 'get-last-logs': {
      getLastLogs()
        .then(logs => {
          sendMainWindowMsg(NODE_EVENT, 'last-node-logs', logs)
        })
        .catch(e => {
          logger.error('error while reading logs', e.toString())
        })
      break
    }
    default:
  }
})

nodeUpdater.on('update-available', info => {
  sendMainWindowMsg(AUTO_UPDATE_EVENT, 'node-update-available', info)
})

nodeUpdater.on('download-progress', info => {
  sendMainWindowMsg(AUTO_UPDATE_EVENT, 'node-download-progress', info)
})

nodeUpdater.on('update-downloaded', info => {
  sendMainWindowMsg(AUTO_UPDATE_EVENT, 'node-update-ready', info)
})

autoUpdater.on('download-progress', info => {
  sendMainWindowMsg(AUTO_UPDATE_EVENT, 'ui-download-progress', info)
})

autoUpdater.on('update-downloaded', info => {
  sendMainWindowMsg(AUTO_UPDATE_EVENT, 'ui-update-ready', info)
})

ipcMain.on(AUTO_UPDATE_COMMAND, async (event, command, data) => {
  logger.info(`new autoupdate command`, command, data)
  switch (command) {
    case 'start-checking': {
      nodeUpdater.checkForUpdates(data.nodeCurrentVersion, data.isInternalNode)
      break
    }
    case 'update-ui': {
      autoUpdater.quitAndInstall()
      break
    }
    case 'update-node': {
      stopNode(node)
        .then(async () => {
          sendMainWindowMsg(NODE_EVENT, 'node-stopped')
          await updateNode()
          sendMainWindowMsg(NODE_EVENT, 'node-ready')
          sendMainWindowMsg(AUTO_UPDATE_EVENT, 'node-updated')
        })
        .catch(e => {
          sendMainWindowMsg(NODE_EVENT, 'node-failed')
          sendMainWindowMsg(AUTO_UPDATE_EVENT, 'node-update-failed')
          logger.error('error while updating node', e.toString())
        })
      break
    }
    default:
  }
})

function checkForUpdates() {
  if (isDev) {
    return
  }

  async function runCheck() {
    try {
      await autoUpdater.checkForUpdates()
    } catch (e) {
      logger.error('error while checking UI update', e.toString())
    } finally {
      setTimeout(runCheck, 10 * 60 * 1000)
    }
  }

  runCheck()
}

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

function createSearchWindow() {
  searchWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, 'preload.js'),
    },
    parent: mainWindow,
    show: false,
  })
  searchWindow.loadURL(`http://localhost:${expressPort}/`)
  searchWindow.on('closed', () => {
    searchWindow = null
  })
}

let lastUsedFlipId
ipcMain.on(IMAGE_SEARCH_TOGGLE, (_event, {on, id}) => {
  if (on) {
    if (lastUsedFlipId !== id) {
      createSearchWindow()
      lastUsedFlipId = id
    }
    if (!searchWindow) createSearchWindow()
    searchWindow.show()
    searchWindow.focus()
  } else {
    searchWindow.hide()
  }
})

ipcMain.on(IMAGE_SEARCH_PICK, (_event, message) => {
  sendMainWindowMsg(IMAGE_SEARCH_PICK, message)
})

ipcMain.on('reload', () => {
  loadRoute(mainWindow, 'dashboard')
})

function sendMainWindowMsg(channel, message, data) {
  if (!mainWindow || !mainWindow.webContents || mainWindow.forceClose) {
    return
  }
  try {
    mainWindow.webContents.send(channel, message, data)
  } catch (e) {
    logger.error('cannot send msg to main window', e.toString())
  }
}
