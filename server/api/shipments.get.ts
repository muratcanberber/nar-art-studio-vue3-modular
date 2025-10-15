import { defineEventHandler } from 'h3'
import { useDatabase } from '../utils/db'

export default defineEventHandler(() => {
  const db = useDatabase()
  const rows = db
    .prepare(
      `
      SELECT order_id, cargo_code, status, shipped_at, delivered_at, payment_status
      FROM shipments
      ORDER BY created_at DESC
    `
    )
    .all() as {
    order_id: string
    cargo_code: string
    status: string
    shipped_at: string | null
    delivered_at: string | null
    payment_status: string
  }[]

  return rows
})
