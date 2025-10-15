import { defineEventHandler } from 'h3'
import { useDatabase } from '../utils/db'

export default defineEventHandler(() => {
  const db = useDatabase()
  return db
    .prepare(
      `
      SELECT id, name, sku, price, stock, status, image, vendor
      FROM products
      ORDER BY name ASC
    `
    )
    .all()
})
