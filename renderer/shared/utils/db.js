import nanoid from 'nanoid'

export const dbProxy = {
  get(k, ns, opts) {
    return global.ipcRenderer.invoke('DB_GET', [k, ns, opts])
  },
  put(k, v, ns, opts) {
    return global.ipcRenderer.invoke('DB_PUT', [k, v, ns, opts])
  },
  clear(ns) {
    return global.ipcRenderer.invoke('DB_CLEAR', [ns])
  },
}

export function createEpochDb(epoch, dbName, opts = {valueEncoding: 'json'}) {
  const ns = [epoch, dbName]
  const args = [ns, opts]

  // eslint-disable-next-line no-shadow
  const safeReadIds = async () => {
    try {
      return await dbProxy.get('ids', ...args)
    } catch {
      return []
    }
  }

  return {
    get(k) {
      return dbProxy.get(k, ...args)
    },
    async put({id = nanoid(), ...v}) {
      const prevIds = await safeReadIds()

      if (!prevIds.includes(id))
        await dbProxy.put('ids', prevIds.concat(id), ...args)

      await dbProxy.put(id, v, ...args)

      return id
    },
    async all() {
      return Promise.all(
        (await safeReadIds()).map(async id => ({
          id,
          ...(await this.get(id)),
        }))
      )
    },
    clear() {
      return dbProxy.clear(ns)
    },
  }
}

// const {levelup, leveldown, dbPath, sub} = global

const idenaDb = {}

export function requestDb(name = 'db') {
  // if (idenaDb === null) {
  //   idenaDb = levelup(leveldown(dbPath(name)))

  //   if (typeof window !== 'undefined') {
  //     window.addEventListener('beforeunload', async () => {
  //       if (idenaDb?.isOpen()) await idenaDb.close()
  //     })
  //   }
  // }
  return idenaDb
}

export const epochDb = (db, epoch, options) => {
  const epochPrefix = `epoch${epoch}`

  const nextOptions = {
    valueEncoding: 'json',
    ...options,
  }

  let targetDb

  switch (typeof dbProxy) {
    case 'string':
      // targetDb = sub(sub(requestDb(), db), epochPrefix, nextOptions)
      break
    case 'object':
      // targetDb = sub(db, epochPrefix, nextOptions)
      break
    default:
      throw new Error('db should be either string or Level instance')
  }

  return {
    async all() {
      try {
        return await loadPersistedItems(targetDb)
      } catch (error) {
        if (error.notFound) return []
      }
    },
    load(id) {
      return targetDb.get(normalizeId(id))
    },
    put(item) {
      const {id} = item
      return id
        ? updatePersistedItem(targetDb, normalizeId(id), item)
        : addPersistedItem(targetDb, item)
    },
    async batchPut(items) {
      const ids = await safeReadIds(targetDb)

      const newItems = items.filter(({id}) => !ids.includes(normalizeId(id)))

      const newIds = []

      let batch = targetDb.batch()

      for (const {id = nanoid(), ...item} of newItems) {
        const normalizedId = normalizeId(id)
        newIds.push(normalizedId)
        batch = batch.put(normalizedId, item)
      }

      const savedItems = await Promise.all(
        ids.map(async id => {
          const normalizedId = normalizeId(id)
          return {
            ...(await targetDb.get(normalizedId)),
            id: normalizedId,
          }
        })
      )

      for (const {id, ...item} of savedItems) {
        batch = batch.put(id, {
          ...item,
          ...items.find(x => x.id === id),
        })
      }

      return batch.put('ids', ids.concat(newIds)).write()
    },
    delete(id) {
      return deletePersistedItem(targetDb, normalizeId(id))
    },
    clear() {
      return clearPersistedItems(targetDb)
    },
    originDb: targetDb,
  }
}

export async function loadPersistedItems(db) {
  const ids = (await db.get('ids')).map(normalizeId)

  return Promise.all(
    ids.map(async id => ({
      id,
      ...(await db.get(id)),
    }))
  )
}

export async function addPersistedItem(
  db,
  {id = normalizeId(nanoid()), ...item}
) {
  const ids = [...(await safeReadIds(db)), id]

  await db
    .batch()
    .put('ids', ids)
    .put(id, item)
    .write()

  return {...item, id}
}

export async function updatePersistedItem(db, id, item) {
  try {
    const nextItem = {...(await db.get(id)), ...item}
    await db.put(id, nextItem)
    return {...nextItem, id}
  } catch (error) {
    if (error.notFound) return addPersistedItem(db, {id, ...item})
    throw new Error(error.message)
  }
}

export async function deletePersistedItem(db, id) {
  return db
    .batch()
    .put('ids', await safeReadIds(db).filter(x => x !== id))
    .del(id)
    .write()
}

export function clearPersistedItems(db) {
  return db.clear()
}

async function safeReadIds(db) {
  try {
    return (await db.get('ids')).map(normalizeId)
  } catch (error) {
    if (error.notFound) return []
    throw new Error(error)
  }
}

function normalizeId(id) {
  return id?.toLowerCase()
}
