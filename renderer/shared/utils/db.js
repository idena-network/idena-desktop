import nanoid from 'nanoid'

export const epochDb = (db, epoch, options) => {
  const epochPrefix = `epoch${epoch}`

  const nextOptions = {
    valueEncoding: 'json',
    ...options,
  }

  let targetDb

  switch (typeof db) {
    case 'string':
      targetDb = global.sub(global.sub(global.db, db), epochPrefix, nextOptions)
      break
    case 'object':
      targetDb = global.sub(db, epochPrefix, nextOptions)
      break
    default:
      throw new Error('db should be either string or Level instance')
  }

  return {
    all() {
      return loadPersistedItems(targetDb)
    },
    load(id) {
      return targetDb.get(id)
    },
    put(item) {
      const {id} = item
      return id
        ? updatePersistedItem(targetDb, id, item)
        : addPersistedItem(targetDb, item)
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

export async function addPersistedItem(db, item) {
  const id = nanoid()

  const ids = [...(await safeReadIds(db)), id]

  await db
    .batch()
    .put('ids', ids)
    .put(id, item)
    .write()

  return {...item, id}
}

export async function updatePersistedItem(db, id, item) {
  const nextItem = {...(await db.get(id)), ...item}

  await db.put(id, nextItem)

  return {...nextItem, id}
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
