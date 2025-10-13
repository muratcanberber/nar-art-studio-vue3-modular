import { defineStore } from 'pinia'

export type MaterialItem = {
  id: string
  name: string
  stock_qty: number
  min_stock: number
  pending: number
  location: string
  unit_cost: number
  last_updated: Date
}

export type MaterialCategory = {
  id: string
  name: string
  description?: string
  items: MaterialItem[]
}

type State = {
  categories: MaterialCategory[]
}

const createItem = (
  id: string,
  name: string,
  stock_qty: number,
  min_stock: number,
  pending: number,
  location: string,
  unit_cost: number
): MaterialItem => ({
  id,
  name,
  stock_qty,
  min_stock,
  pending,
  location,
  unit_cost,
  last_updated: new Date()
})

export const useMaterials = defineStore('materials', {
  state: (): State => ({
    categories: [
      {
        id: 'canvas',
        name: 'Tuvaller',
        description: 'Hazır ve özel ölçü tuval stokları',
        items: [
          createItem('canvas-50x70', 'Tuval 50x70', 12, 8, 5, 'Raf A1', 210),
          createItem('canvas-70x100', 'Tuval 70x100', 4, 6, 2, 'Raf A2', 340)
        ]
      },
      {
        id: 'frame',
        name: 'Çerçeveler',
        description: 'Ahşap ve MDF çerçeveler',
        items: [
          createItem('frame-black-18', 'MDF Çerçeve Siyah 18mm', 6, 10, 4, 'Raf B3', 95),
          createItem('frame-oak-22', 'Masif Meşe 22mm', 3, 5, 1, 'Raf B5', 165)
        ]
      },
      {
        id: 'relief',
        name: 'Rölyef Pasta',
        description: 'Doku çalışmalarında kullanılan rölyef pastalar',
        items: [
          createItem('relief-standard', 'Akrelik Rölyef Pasta 500ml', 5, 4, 2, 'Raf C1', 120),
          createItem('relief-premium', 'Premium Rölyef Pasta 1L', 2, 3, 1, 'Raf C2', 210)
        ]
      }
    ]
  }),
  getters: {
    flatItems: state => state.categories.flatMap(cat => cat.items.map(item => ({ ...item, categoryId: cat.id, categoryName: cat.name })))
  },
  actions: {
    addCategory(name: string, description?: string) {
      const id = name.toLowerCase().replace(/\s+/g, '-')
      if (this.categories.some(c => c.id === id)) return
      this.categories.push({ id, name, description, items: [] })
    },
    addItem(categoryId: string, item: Omit<MaterialItem, 'last_updated'>) {
      const category = this.categories.find(c => c.id === categoryId)
      if (!category) return
      category.items.push({ ...item, last_updated: new Date() })
    },
    updateQuantity(categoryId: string, itemId: string, qty: number) {
      const category = this.categories.find(c => c.id === categoryId)
      const material = category?.items.find(i => i.id === itemId)
      if (!material) return
      material.stock_qty = qty
      material.last_updated = new Date()
    },
    adjustQuantity(categoryId: string, itemId: string, delta: number) {
      const category = this.categories.find(c => c.id === categoryId)
      const material = category?.items.find(i => i.id === itemId)
      if (!material) return
      material.stock_qty = Math.max(0, material.stock_qty + delta)
      material.last_updated = new Date()
    },
    updateUnitCost(categoryId: string, itemId: string, unitCost: number) {
      const category = this.categories.find(c => c.id === categoryId)
      const material = category?.items.find(i => i.id === itemId)
      if (!material) return
      material.unit_cost = unitCost
      material.last_updated = new Date()
    }
  }
})
