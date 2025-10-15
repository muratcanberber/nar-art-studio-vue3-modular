import { defineEventHandler } from 'h3'
import { useDatabase } from '../utils/db'

export default defineEventHandler(() => {
  const db = useDatabase()
  return db
    .prepare(
      `
      SELECT id, name, unit, in_stock, threshold
      FROM materials
      ORDER BY name ASC
    `
    )
    .all()
})
