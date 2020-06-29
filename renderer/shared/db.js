import Dexie from 'dexie'

export function epochDb(epoch) {
  const db = new Dexie(`idena.epoch${epoch}`)
  db.version(1).stores({invites: 'id,status,&hash'})
  return db
}
