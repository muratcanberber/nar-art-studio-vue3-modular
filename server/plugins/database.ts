import bcrypt from 'bcryptjs'
import { defineNitroPlugin } from '#imports'
import { useDatabase } from '../utils/db'

const baseImage = (slug: string) => `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=480&q=80`

type SeedOrder = {
  id: string
  customer_name: string
  phone: string
  product_name: string
  product_image: string
  frame_color: string
  size: string
  notes: string | null
  vendor: string
  total_price: number
  current_stage: number
  planned_start: string
  deadline: string
  created_at: string
}

type SeedShipment = {
  order_id: string
  cargo_code: string
  status: string
  shipped_at: string | null
  delivered_at: string | null
  payment_status: string
}

type SeedMaterial = {
  name: string
  unit: string
  in_stock: number
  threshold: number
}

type SeedProduct = {
  name: string
  sku: string
  price: number
  stock: number
  status: string
  image: string
  vendor: string
}

type SeedCost = {
  name: string
  planned: number
  actual: number
}

const now = Date.now()

const seedOrders: SeedOrder[] = [
  {
    id: 'SO-10023',
    customer_name: 'Ayse K.',
    phone: '+905555555555',
    product_name: 'Minimal Nar Çizimi',
    product_image: baseImage('photo-1526481280695-3c469b0e7ee0'),
    frame_color: 'Mat Siyah',
    size: '50 x 70 cm',
    notes: 'Salon için teslimatta hediye notu ekleyin.',
    vendor: 'Shopier',
    total_price: 1850,
    current_stage: 3,
    planned_start: new Date(now - 2 * 86400000).toISOString(),
    deadline: new Date(now + 2 * 86400000).toISOString(),
    created_at: new Date(now - 3 * 86400000).toISOString()
  },
  {
    id: 'SO-10024',
    customer_name: 'Burak T.',
    phone: '+905312223344',
    product_name: 'Geometrik Doku Triptik',
    product_image: baseImage('photo-1500530855697-b586d89ba3ee'),
    frame_color: 'Ceviz',
    size: '3 x (40 x 60 cm)',
    notes: null,
    vendor: 'Shopier',
    total_price: 2900,
    current_stage: 5,
    planned_start: new Date(now - 1 * 86400000).toISOString(),
    deadline: new Date(now + 1 * 86400000).toISOString(),
    created_at: new Date(now - 1 * 86400000).toISOString()
  },
  {
    id: 'SO-10025',
    customer_name: 'Selin D.',
    phone: '+905445556677',
    product_name: 'Rölyef Dokulu Abstract',
    product_image: baseImage('photo-1526481280693-3bfa7568e8f8'),
    frame_color: 'Koyu Meşe',
    size: '60 x 90 cm',
    notes: 'Farklı bir altın tonuyla boyansın.',
    vendor: 'Etsy',
    total_price: 1200,
    current_stage: 2,
    planned_start: new Date(now - 4 * 86400000).toISOString(),
    deadline: new Date(now - 1 * 86400000).toISOString(),
    created_at: new Date(now - 5 * 86400000).toISOString()
  },
  {
    id: 'SO-10026',
    customer_name: 'Merve L.',
    phone: '+905377778899',
    product_name: 'Pastel Tonlarda Modern Tuval',
    product_image: baseImage('photo-1519710164239-da123dc03ef4'),
    frame_color: 'Doğal Ahşap',
    size: '70 x 100 cm',
    notes: null,
    vendor: 'Shopier',
    total_price: 3400,
    current_stage: 1,
    planned_start: new Date(now + 1 * 86400000).toISOString(),
    deadline: new Date(now + 10 * 86400000).toISOString(),
    created_at: new Date(now - 12 * 3600000).toISOString()
  }
]

const seedShipments: SeedShipment[] = [
  {
    order_id: 'SO-10023',
    cargo_code: 'YT-123456789',
    status: 'Yolda',
    shipped_at: new Date(now - 1 * 86400000).toISOString(),
    delivered_at: null,
    payment_status: 'Bekliyor'
  },
  {
    order_id: 'SO-10024',
    cargo_code: 'TR-987654321',
    status: 'Teslim Edildi',
    shipped_at: new Date(now - 3 * 86400000).toISOString(),
    delivered_at: new Date(now - 1 * 86400000).toISOString(),
    payment_status: 'Odendi'
  },
  {
    order_id: 'SO-10025',
    cargo_code: 'AR-456789123',
    status: 'Hazırlanıyor',
    shipped_at: null,
    delivered_at: null,
    payment_status: 'Bekliyor'
  }
]

const seedMaterials: SeedMaterial[] = [
  { name: 'Pamuklu Tuval', unit: 'adet', in_stock: 45, threshold: 30 },
  { name: 'Ahşap Çerçeve (70x100)', unit: 'adet', in_stock: 18, threshold: 20 },
  { name: 'Akrilik Boya Seti', unit: 'set', in_stock: 12, threshold: 8 },
  { name: 'Koruyucu Vernik', unit: 'litre', in_stock: 6, threshold: 5 }
]

const seedProducts: SeedProduct[] = [
  {
    name: 'Minimal Nar Çizimi',
    sku: 'PR-1001',
    price: 1850,
    stock: 8,
    status: 'Aktif',
    image: baseImage('photo-1500530855697-b586d89ba3ee'),
    vendor: 'Shopier'
  },
  {
    name: 'Rölyef Dokulu Abstract',
    sku: 'PR-1002',
    price: 1200,
    stock: 5,
    status: 'Taslak',
    image: baseImage('photo-1526483360412-f4dbaf036963'),
    vendor: 'Etsy'
  },
  {
    name: 'Pastel Modern Tuval',
    sku: 'PR-1003',
    price: 3400,
    stock: 11,
    status: 'Aktif',
    image: baseImage('photo-1519710164239-da123dc03ef4'),
    vendor: 'Shopier'
  }
]

const seedCosts: SeedCost[] = [
  { name: 'Malzeme', planned: 9500, actual: 8800 },
  { name: 'İşçilik', planned: 6200, actual: 6400 },
  { name: 'Kargo', planned: 2100, actual: 1950 },
  { name: 'Pazarlama', planned: 3200, actual: 2850 }
]

const defaultUser = {
  username: 'admin',
  password: 'narstudio123'
}

export default defineNitroPlugin(async () => {
  const db = useDatabase()

  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS shipments;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS materials;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS cost_categories;
    PRAGMA foreign_keys = ON;
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT NOT NULL,
      frame_color TEXT NOT NULL,
      size TEXT NOT NULL,
      notes TEXT,
      vendor TEXT NOT NULL,
      total_price REAL NOT NULL,
      current_stage INTEGER NOT NULL,
      planned_start TEXT NOT NULL,
      deadline TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      cargo_code TEXT NOT NULL,
      status TEXT NOT NULL,
      shipped_at TEXT,
      delivered_at TEXT,
      payment_status TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      in_stock REAL NOT NULL,
      threshold REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      status TEXT NOT NULL,
      image TEXT NOT NULL,
      vendor TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cost_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      planned REAL NOT NULL,
      actual REAL NOT NULL
    );
  `)

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (userCount.count === 0) {
    const passwordHash = bcrypt.hashSync(defaultUser.password, 10)
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(defaultUser.username, passwordHash)
  }

  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }
  if (orderCount.count === 0) {
    const insertOrder = db.prepare(
      `
      INSERT INTO orders (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    )
    const insertShipment = db.prepare(
      `
      INSERT INTO shipments (
        order_id,
        cargo_code,
        status,
        shipped_at,
        delivered_at,
        payment_status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `
    )
    const insertMaterial = db.prepare(
      'INSERT INTO materials (name, unit, in_stock, threshold) VALUES (?, ?, ?, ?)'
    )
    const insertProduct = db.prepare(
      'INSERT INTO products (name, sku, price, stock, status, image, vendor) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    const insertCost = db.prepare(
      'INSERT INTO cost_categories (name, planned, actual) VALUES (?, ?, ?)'
    )

    db.transaction(() => {
      for (const order of seedOrders) {
        insertOrder.run(
          order.id,
          order.customer_name,
          order.phone,
          order.product_name,
          order.product_image,
          order.frame_color,
          order.size,
          order.notes,
          order.vendor,
          order.total_price,
          order.current_stage,
          order.planned_start,
          order.deadline,
          order.created_at
        )
      }
      for (const shipment of seedShipments) {
        insertShipment.run(
          shipment.order_id,
          shipment.cargo_code,
          shipment.status,
          shipment.shipped_at,
          shipment.delivered_at,
          shipment.payment_status
        )
      }
      for (const material of seedMaterials) {
        insertMaterial.run(material.name, material.unit, material.in_stock, material.threshold)
      }
      for (const product of seedProducts) {
        insertProduct.run(
          product.name,
          product.sku,
          product.price,
          product.stock,
          product.status,
          product.image,
          product.vendor
        )
      }
      for (const cost of seedCosts) {
        insertCost.run(cost.name, cost.planned, cost.actual)
      }
    })()
  }
})
