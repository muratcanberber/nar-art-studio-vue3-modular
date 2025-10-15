<template>
  <div class="flex flex-col gap-6">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar icon="i-lucide-circle-dollar-sign" size="md" class="bg-emerald-500/20 text-emerald-400" />
          <div>
            <h2 class="text-lg font-semibold">Shopier Ödeme Özeti</h2>
            <p class="text-sm text-gray-400">Son 7 günde kargoya çıkan siparişler.</p>
          </div>
        </div>
      </template>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <UCard
          variant="soft"
          class="flex flex-col justify-between overflow-hidden border-slate-800/70 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent"
        >
          <p class="text-sm text-emerald-100">Yaklaşan Çarşamba</p>
          <p class="text-base font-semibold text-white">{{ nextPaymentSlot }}</p>
        </UCard>

        <UCard
          v-for="metric in metrics"
          :key="metric.label"
          variant="soft"
          class="flex flex-col gap-1 overflow-hidden border-slate-800/70"
          :class="metric.cardClass"
        >
          <div class="flex items-center justify-between text-sm text-gray-200">
            <span>{{ metric.label }}</span>
            <UIcon :name="metric.icon" class="text-lg/none opacity-70" />
          </div>
          <div class="flex items-end gap-2">
            <span class="text-2xl font-semibold text-gray-100">{{ metric.value }}</span>
            <small v-if="metric.suffix" class="text-xs text-gray-200/90">{{ metric.suffix }}</small>
          </div>
        </UCard>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold">Kargo ve Ödeme Detayları</h2>
            <p class="text-sm text-gray-400">Gönderi durumlarını ve ödeme süreçlerini takip edin.</p>
          </div>
          <UButton size="sm" icon="i-lucide-download" color="gray" @click="exportRows">CSV indir</UButton>
        </div>
      </template>

      <div v-if="shipmentsList.length" class="flex flex-col gap-3">
        <UCard
          v-for="shipment in shipmentsList"
          :key="shipment.order_id"
          variant="soft"
          class="flex flex-col gap-3 border-slate-800/70 bg-slate-900/60 backdrop-blur"
        >
          <header class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex flex-col">
              <span class="text-sm text-gray-500">Sipariş</span>
              <span class="text-base font-semibold text-gray-100">{{ shipment.order_id }}</span>
              <span class="text-xs uppercase tracking-widest text-gray-500">Kargo Kodu: {{ shipment.cargo_code }}</span>
            </div>
            <UBadge :label="shipment.status" :color="shipment.statusColor" variant="subtle" />
          </header>

          <div class="grid gap-3 md:grid-cols-2">
            <UCard variant="outline" class="border-slate-800/70 bg-slate-900/70">
              <p class="text-xs text-gray-400">Ödeme durumu</p>
              <p class="text-sm font-medium text-gray-100">{{ shipment.payment_status }}</p>
            </UCard>
            <UCard variant="outline" class="border-slate-800/70 bg-slate-900/70">
              <p class="text-xs text-gray-400">Kargoya veriliş</p>
              <p class="text-sm font-medium text-gray-100">{{ shipment.shipped_at }}</p>
            </UCard>
          </div>

          <footer class="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
            <span>{{ shipment.delivered_at }}</span>
            <ULink
              :href="shipment.trackUrl"
              target="_blank"
              rel="noreferrer"
              class="text-emerald-400 hover:text-emerald-300"
            >
              Kargo Takip
            </ULink>
          </footer>
        </UCard>
      </div>

      <UAlert
        v-else
        title="Gösterilecek gönderi bulunamadı"
        description="Yeni gönderiler oluşturulduğunda burada belirecek."
        color="gray"
        icon="i-lucide-package-search"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { nextWednesday, formatDateTR } from '~/composables/useNextWednesday'
import { toCSV, downloadCSV } from '~/composables/useCsv'

type Shipment = {
  order_id: string
  cargo_code: string
  status: string
  shipped_at: string | null
  delivered_at: string | null
  payment_status: string
}

type Order = {
  id: string
  total_price: number
  customer_name: string
  product_name: string
}

const { data: shipmentsData } = await useAsyncData('shipments', () => $fetch<Shipment[]>('/api/shipments'))
const { data: ordersData } = await useAsyncData('orders', () => $fetch<Order[]>('/api/orders'))

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

const dateFormatter = new Intl.DateTimeFormat('tr-TR')

const nextPaymentSlot = computed(() => `${formatDateTR(nextWednesday())} - 09:00`)

const shippedThisWeek = computed(() => {
  // Filter again on the client so we keep the reactive list in sync with real-time updates.
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return (shipmentsData.value ?? []).filter(shipment => {
    if (!shipment.shipped_at) return false
    return new Date(shipment.shipped_at).getTime() >= sevenDaysAgo
  })
})

const awaitingPayments = computed(() =>
  shippedThisWeek.value.filter(shipment => shipment.payment_status === 'Bekliyor')
)

const toplamBeklenen = computed(() =>
  awaitingPayments.value.reduce((total, shipment) => {
    const orderTotal = (ordersData.value ?? []).find(order => order.id === shipment.order_id)?.total_price ?? 0
    return total + orderTotal
  }, 0)
)

const deliveredCount = computed(
  () => (shipmentsData.value ?? []).filter(shipment => shipment.status === 'Teslim Edildi').length
)

const metrics = computed(() => [
  {
    label: 'Bekleyen Kargo',
    value: awaitingPayments.value.length.toString(),
    suffix: 'adet',
    icon: 'i-lucide-truck',
    cardClass: 'bg-gradient-to-br from-sky-500/20 via-sky-500/5 to-transparent'
  },
  {
    label: 'Teslim Edildi',
    value: deliveredCount.value.toString(),
    suffix: 'adet',
    icon: 'i-lucide-baggage-claim',
    cardClass: 'bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent'
  },
  {
    label: 'Toplam Beklenen Tutar',
    value: currencyFormatter.format(toplamBeklenen.value),
    icon: 'i-lucide-piggy-bank',
    cardClass: 'bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent'
  }
])

const shipmentsList = computed(() =>
  (shipmentsData.value ?? []).map(shipment => ({
    ...shipment,
    shipped_at: shipment.shipped_at ? dateFormatter.format(new Date(shipment.shipped_at)) : 'Bekleniyor',
    delivered_at: shipment.delivered_at
      ? `Teslim: ${dateFormatter.format(new Date(shipment.delivered_at))}`
      : 'Teslim bilgisi bekleniyor',
    statusColor: shipment.status === 'Teslim Edildi' ? 'gray' : shipment.status === 'Yolda' ? 'gray' : 'black',
    trackUrl: `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(shipment.cargo_code)}`
  }))
)

function exportRows() {
  const rows = shipmentsList.value.map(shipment => ({
    order_id: shipment.order_id,
    cargo_code: shipment.cargo_code,
    status: shipment.status,
    payment_status: shipment.payment_status,
    shipped_at: shipment.shipped_at,
    delivered_at: shipment.delivered_at
  }))

  downloadCSV(
    `kargo_finans_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['order_id', 'cargo_code', 'status', 'payment_status', 'shipped_at', 'delivered_at'])
  )
}
</script>
