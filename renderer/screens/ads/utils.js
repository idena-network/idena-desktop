import {dbProxy, createEpochDb} from '../../shared/utils/db'

export function createAdDb(epoch = -1) {
export function createAdDb(epoch) {
  const ns = [epoch, 'ads']

  const db = createEpochDb(...ns)

  const coverDbArgs = [['covers', ...ns], {valueEncoding: 'binary'}]

  return {
    async put({cover, ...ad}) {
      const id = await db.put(ad)
      if (cover) await dbProxy.put(id, cover, ...coverDbArgs)
      return id
    },
    async get(id) {
      return {
        ...(await db.get(id)),
        cover: await dbProxy.get(id, ...coverDbArgs),
      }
    },
    async getAsHex(id) {
      return dbProxy.get(id, ns, {
        valueEncoding: 'hex',
      })
    },
    async all() {
      return Promise.all(
        (await db.all()).map(async ({id, ...ad}) => ({
          id,
          cover: await dbProxy.get(id, ...coverDbArgs),
          ...ad,
        }))
      )
    },
    clear() {
      return db.clear()
    },
  }
}

export function buildProfile({ads}) {
  return {ads}
}
