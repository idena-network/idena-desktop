// eslint-disable-next-line import/no-extraneous-dependencies
const {ipcMain} = require('electron')
const levelup = require('levelup')
const leveldown = require('leveldown')
const sub = require('subleveldown')

const dbs = new Map()

const resolveDb = (db, ns, opts) => {
  if (typeof ns !== 'string' && !Array.isArray(ns))
    throw Error('ns should be either Array or String')

  if (ns) {
    const targetNs = Array.isArray(ns) ? ns.join('!') : ns

    const targetDb = targetNs
      .split('!')
      .reduce((acc, curr) => sub(acc, String(curr), opts), db)

    return dbs.has(targetNs)
      ? dbs.get(targetNs)
      : dbs.set(targetNs, targetDb).get(targetNs)
  }

  return db
}

module.exports = function setup() {
  const db = levelup(leveldown('idena.db'))

  ipcMain.handle('DB_GET', (_, [k, ns, opts]) =>
    resolveDb(db, ns, opts).get(k, opts)
  )
  ipcMain.handle('DB_PUT', (_, [k, v, ns, opts]) =>
    resolveDb(db, ns, opts).put(k, v)
  )
  ipcMain.handle('DB_CLEAR', (_, [ns]) => resolveDb(db, ns).clear())

  return db
}
