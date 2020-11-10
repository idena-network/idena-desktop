import nanoid from 'nanoid'

const {levelup, leveldown, dbPath, sub} = global

let idenaDb = null

export function requestDb(name = 'db') {
    if (idenaDb === null) idenaDb = levelup(leveldown(dbPath(name)))
    return idenaDb
  }

export const epochDb = (db, epoch, options) => {
  const epochPrefix = `epoch${epoch}`

  const nextOptions = {
    valueEncoding: 'json',
    ...options,
  }

  let targetDb

  switch (typeof db) {
    case 'string':
      targetDb = sub(sub(requestDb(), db), epochPrefix, nextOptions)
      break
    case 'object':
      targetDb = sub(db, epochPrefix, nextOptions)
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
      return targetDb.get(id)
    },
    put(item) {
      const {id} = item
      return id
        ? updatePersistedItem(targetDb, id, item)
        : addPersistedItem(targetDb, {id, ...item})
    },
    async batchPut(items) {
      const ids = await safeReadIds(targetDb)

      const newItems = items.filter(({id}) => !ids.includes(id))

      const newIds = []

      let batch = targetDb.batch()

      for (const {id = nanoid(), ...item} of newItems) {
        newIds.push(id)
        batch = batch.put(id, item)
      }

      const savedItems = await Promise.all(
        ids.map(async id => ({...(await targetDb.get(id)), id}))
      )

      for (const {id, ...item} of savedItems) {
        batch = batch.put(id, {...item, ...items.find(x => x.id === id)})
      }

      return batch.put('ids', ids.concat(newIds)).write()
    },
    delete(id) {
      return deletePersistedItem(targetDb, id)
    },
    clear() {
      return clearPersistedItems(targetDb)
    },
    originDb: targetDb,
  }
}

export async function loadPersistedItems(db) {
  const ids = await db.get('ids')

  return Promise.all(
    ids.map(async id => ({
      id,
      ...(await db.get(id)),
    }))
  )
}

export async function addPersistedItem(db, {id = nanoid(), ...item}) {
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
    return await db.get('ids')
  } catch (error) {
    if (error.notFound) return []
    throw new Error(error)
  }
}
