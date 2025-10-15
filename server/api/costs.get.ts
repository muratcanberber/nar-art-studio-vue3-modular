import { defineEventHandler } from 'h3'
import { useDatabase } from '../utils/db'

export default defineEventHandler(() => {
  const db = useDatabase()
  return db
    .prepare(
      `
      SELECT id, name, planned, actual
      FROM cost_categories
      ORDER BY name ASC
    `
    )
    .all()
})
