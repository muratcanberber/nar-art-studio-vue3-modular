import { defineStore } from 'pinia'

export type Product = {
  id: string
  title: string
  image: string
  price: number
  category: string
  sku: string
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  last_synced_at: Date | null
}

type ShopierResponse = {
  id: string
  title: string
  image: string
  price: number
  category: string
  sku: string
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
}

async function requestShopierProducts(endpoint: string, token: string): Promise<ShopierResponse[]> {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error(`Shopier API error: ${response.status}`)
  }

  return (await response.json()) as ShopierResponse[]
}

export const useProducts = defineStore('products', {
  state: () => ({
    items: [
      {
        id: 'PR-11001',
        title: 'Minimal Nar Tablosu',
        image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=480&q=80',
        price: 1850,
        category: 'Minimal',
        sku: 'MIN-NAR-50x70',
        stock_status: 'in_stock',
        last_synced_at: null
      },
      {
        id: 'PR-11002',
        title: 'Geometrik Doku Triptiği',
        image: 'https://images.unsplash.com/photo-1526498460520-4f248527c914?auto=format&fit=crop&w=480&q=80',
        price: 2900,
        category: 'Triptiğe Özel',
        sku: 'GEO-TRI-3x40x60',
        stock_status: 'low_stock',
        last_synced_at: null
      }
    ] as Product[],
    isSyncing: false,
    lastSyncError: '' as string | null
  }),
  actions: {
    async syncFromShopier(endpoint = import.meta.env.VITE_SHOPIER_PRODUCTS_URL, token = import.meta.env.VITE_SHOPIER_TOKEN) {
      if (!endpoint || !token) {
        this.lastSyncError = 'Shopier API ayarları eksik. Lütfen .env dosyasını güncelleyin.'
        return
      }

      this.isSyncing = true
      this.lastSyncError = null
      try {
        const payload = await requestShopierProducts(endpoint, token)
        this.items = payload.map(product => ({
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          category: product.category,
          sku: product.sku,
          stock_status: product.stockStatus,
          last_synced_at: new Date()
        }))
      } catch (error: any) {
        this.lastSyncError = error.message ?? 'Bilinmeyen hata'
      } finally {
        this.isSyncing = false
      }
    }
  }
})
