/* eslint-disable import/no-extraneous-dependencies */
const {app} = require('electron')
const isDev = require('electron-is-dev')

const loadRoute = (win, routeName) => {
  if (isDev) {
    win.loadURL(`http://localhost:8000/${routeName}`)
    win.openDevTools({mode: 'detach'})
  } else {
    win.loadFile(`${app.getAppPath()}/renderer/out/${routeName}.html`)
  }
}

module.exports = loadRoute
