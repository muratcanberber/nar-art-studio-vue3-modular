import { defineEventHandler } from 'h3'
import { useDatabase } from '../utils/db'

export default defineEventHandler(() => {
  const db = useDatabase()
  return db
    .prepare(
      `
      SELECT
        id,
        customer_name,
        phone,
        product_name,
        product_image,
        frame_color,
        size,
        notes,
        vendor,
        total_price,
        current_stage,
        planned_start,
        deadline,
        created_at
      FROM orders
      ORDER BY datetime(created_at) DESC
    `
    )
    .all()
})
