import { defineStore } from 'pinia'

export type OrderStage =
  | 'Planlama'
  | 'Hazirlik'
  | 'Uretim'
  | 'Cerceve Montaj'
  | 'Paketleme'
  | 'Kargoya Teslim'
  | 'Teslim Tamamlandi'

export type Order = {
  id: string
  customer_name: string
  phone: string
  product_name: string
  product_image: string
  frame_color: string
  size: string
  notes?: string | null
  vendor: string
  total_price: number
  current_stage: number
  planned_start: Date
  deadline: Date
  created_at: Date
}

const baseImage = (slug: string) => `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=480&q=80`

export const useOrders = defineStore('orders', {
  state: () => ({
    items: [
      {
        id: 'SO-10023',
        customer_name: 'Ayse K.',
        phone: '+905555555555',
        product_name: 'Minimal Nar Cizimi',
        product_image: baseImage('photo-1526481280695-3c469b0e7ee0'),
        frame_color: 'Mat Siyah',
        size: '50 x 70 cm',
        notes: 'Salon icin teslimatta hediye notu ekleyin.',
        vendor: 'Shopier',
        total_price: 1850,
        current_stage: 3,
        planned_start: new Date(Date.now() - 2 * 86400000),
        deadline: new Date(Date.now() + 2 * 86400000),
        created_at: new Date(Date.now() - 3 * 86400000)
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
        planned_start: new Date(Date.now() - 1 * 86400000),
        deadline: new Date(Date.now() + 1 * 86400000),
        created_at: new Date(Date.now() - 1 * 86400000)
      },
      {
        id: 'SO-10025',
        customer_name: 'Selin D.',
        phone: '+905445556677',
        product_name: 'Rolyef Dokulu Abstract',
        product_image: baseImage('photo-1526481280693-3bfa7568e8f8'),
        frame_color: 'Koyu Mese',
        size: '60 x 90 cm',
        notes: 'Farkli bir altin tonuyla boyansin.',
        vendor: 'Etsy',
        total_price: 1200,
        current_stage: 2,
        planned_start: new Date(Date.now() - 4 * 86400000),
        deadline: new Date(Date.now() - 1 * 86400000),
        created_at: new Date(Date.now() - 5 * 86400000)
      },
      {
        id: 'SO-10026',
        customer_name: 'Merve L.',
        phone: '+905377778899',
        product_name: 'Pastel Tonlarda Modern Tuval',
        product_image: baseImage('photo-1519710164239-da123dc03ef4'),
        frame_color: 'Dogal Ahsap',
        size: '70 x 100 cm',
        notes: null,
        vendor: 'Shopier',
        total_price: 3400,
        current_stage: 1,
        planned_start: new Date(Date.now() + 1 * 86400000),
        deadline: new Date(Date.now() + 10 * 86400000),
        created_at: new Date(Date.now() - 12 * 3600000)
      }
    ] as Order[]
  }),
  actions: {
    setStage(id: string, stage: number) {
      const order = this.items.find(item => item.id === id)
      if (order) order.current_stage = stage
    },
    upsertOrder(order: Order) {
      const index = this.items.findIndex(item => item.id === order.id)
      if (index >= 0) {
        this.items.splice(index, 1, order)
      } else {
        this.items.push(order)
      }
    }
  }
})
