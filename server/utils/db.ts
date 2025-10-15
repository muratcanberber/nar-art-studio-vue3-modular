import { mkdirSync } from 'node:fs'
import { dirname, join } from 'pathe'
import Database from 'better-sqlite3'

let dbInstance: Database.Database | null = null

export function useDatabase() {
  if (dbInstance) {
    return dbInstance
  }

  const dbPath = join(process.cwd(), '.data', 'app.db')
  mkdirSync(dirname(dbPath), { recursive: true })

  dbInstance = new Database(dbPath)
  dbInstance.pragma('journal_mode = WAL')
  dbInstance.pragma('foreign_keys = ON')

  return dbInstance
}
