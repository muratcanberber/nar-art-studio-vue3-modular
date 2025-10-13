import { defineStore } from 'pinia'

export type ShipmentStatus = 'Hazırlanıyor' | 'Yolda' | 'Teslim Edildi' | 'Teslimatta'

export type Shipment = {
  order_id: string
  cargo_code: string
  status: ShipmentStatus
  shipped_at: Date | null
  delivered_at: Date | null
  payment_status: 'Bekliyor' | 'Ödendi'
  platform_fee: number
}

export const useShipments = defineStore('shipments', {
  state: () => ({
    items: [
      {
        order_id: 'SO-10023',
        cargo_code: 'YT-123456789',
        status: 'Yolda',
        shipped_at: new Date(Date.now() - 1 * 86400000),
        delivered_at: null,
        payment_status: 'Bekliyor',
        platform_fee: 92.5
      },
      {
        order_id: 'SO-10024',
        cargo_code: 'TR-987654321',
        status: 'Teslim Edildi',
        shipped_at: new Date(Date.now() - 3 * 86400000),
        delivered_at: new Date(Date.now() - 1 * 86400000),
        payment_status: 'Ödendi',
        platform_fee: 145
      },
      {
        order_id: 'SO-10025',
        cargo_code: 'AR-456789123',
        status: 'Hazırlanıyor',
        shipped_at: null,
        delivered_at: null,
        payment_status: 'Bekliyor',
        platform_fee: 68.5
      }
    ] as Shipment[]
  }),
  actions: {
    upsert(shipment: Shipment) {
      const index = this.items.findIndex(i => i.order_id === shipment.order_id)
      if (index >= 0) {
        this.items.splice(index, 1, shipment)
      } else {
        this.items.push(shipment)
      }
    }
  }
})
