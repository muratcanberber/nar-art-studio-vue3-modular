<template>
  <div class="flex flex-col gap-6">
    <div class="grid gap-3 sm:grid-cols-3">
      <UCard v-for="stat in compactStats" :key="stat.label" variant="soft" class="border-slate-800/70 py-3">
        <div class="flex items-center gap-3 text-sm text-gray-400">
          <UIcon :name="stat.icon" class="rounded-lg bg-slate-800/80 p-2 text-xl text-emerald-300" />
          <div class="flex flex-col">
            <span class="text-xs uppercase tracking-[0.2em] text-gray-500">{{ stat.label }}</span>
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-semibold text-gray-100">{{ stat.value }}</span>
              <span class="text-xs text-gray-500">{{ stat.hint }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-4 shadow-lg">
      <div>
        <h2 class="text-lg font-semibold text-gray-100">Aktif Siparişler</h2>
        <p class="text-sm text-gray-400">Detaylı aşama ilerlemesi, kargo kodu ve kalan süreyi takip edin.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <USelectMenu v-model="stageFilter" :options="stageFilterOptions" size="sm" class="w-40" />
        <UCheckbox v-model="showDelayedOnly" label="Sadece gecikenler" />
        <UButton size="sm" icon="i-lucide-download" color="gray" @click="exportRows">CSV indir</UButton>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <article
        v-for="order in filteredOrders"
        :key="order.id"
        class="w-full rounded-2xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-lg transition-transform hover:-translate-y-1 hover:border-slate-700"
      >
        <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)_280px]">
          <div class="flex items-start gap-4">
            <img :src="order.product_image" alt="" class="h-28 w-28 rounded-xl object-cover shadow-lg ring-2 ring-slate-800/70" />
            <div class="flex flex-col gap-2 text-sm">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-gray-500">{{ order.customer_name }}</p>
                <p class="text-lg font-semibold text-gray-100">{{ order.product_name }}</p>
                <p class="text-xs text-gray-400">
                  {{ order.frame_color }} • {{ order.size }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <UBadge size="sm" variant="subtle" color="emerald" :label="formatCurrency(order.total_price)" />
                <UBadge size="sm" variant="subtle" color="gray" :label="formatDate(order.created_at)" />
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-sm text-gray-400">
                <span>Üretim aşaması</span>
                <span class="font-medium text-gray-200">{{ progressSteps[order.progressIndex].label }}</span>
              </div>
              <UProgress :value="order.progressPercent" color="emerald" size="sm" class="my-3" />
              <div class="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span
                  v-for="(step, idx) in progressSteps"
                  :key="step.label"
                  class="flex items-center gap-1"
                  :class="idx <= order.progressIndex ? 'text-emerald-300' : 'text-slate-600'"
                >
                  <span class="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-[11px]">
                    {{ idx + 1 }}
                  </span>
                  {{ step.short }}
                </span>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-3 text-sm text-gray-300">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Sipariş Tarihi</p>
                <p class="mt-1 font-semibold text-gray-100">{{ formatDate(order.created_at) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Son Teslim</p>
                <p class="mt-1 font-semibold text-gray-100">{{ formatDate(order.deadline) }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-gray-500">Kalan Süre</p>
                <p class="mt-1 font-semibold" :class="order.overdue ? 'text-rose-300' : 'text-emerald-300'">
                  {{ order.timeLeftLabel }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 rounded-xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-gray-300">
            <div class="flex flex-col gap-1">
              <span class="text-xs uppercase tracking-[0.2em] text-gray-500">DHL Kargo Kodu</span>
              <span class="text-base font-semibold text-gray-100">{{ order.shipment?.cargo_code ?? 'Henüz Atanmadı' }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs uppercase tracking-[0.2em] text-gray-500">DHL Durumu</span>
              <span class="font-medium" :class="statusTone(order.shipment?.status)">
                {{ order.shipment?.status ?? 'Bilgi bekleniyor' }}
              </span>
              <span class="text-xs text-gray-400">
                Ödeme: {{ order.shipment?.payment_status ?? 'Bekliyor' }}
              </span>
            </div>
            <UButton
              v-if="order.shipment?.cargo_code"
              size="sm"
              color="gray"
              variant="soft"
              icon="i-lucide-external-link"
              :to="dhlTrackingUrl(order.shipment.cargo_code)"
              target="_blank"
            >
              DHL Takip
            </UButton>
          </div>
        </div>
      </article>
    </div>

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-lg">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-100">Teslimat Tablosu</h3>
          <p class="text-sm text-gray-400">Siparişlerin kritik tarihlerini ve DHL takip kodlarını hızlıca gözden geçirin.</p>
        </div>
      </div>
      <UTable :columns="tableColumns" :rows="filteredOrders" :ui="tableUi">
        <template #product-data="{ row }">
          <div class="flex items-center gap-4">
            <img :src="row.product_image" alt="" class="h-16 w-16 rounded-lg object-cover shadow-md ring-1 ring-slate-800" />
            <div class="flex flex-col">
              <span class="font-medium text-gray-100">{{ row.product_name }}</span>
              <span class="text-xs text-gray-400">{{ row.frame_color }} • {{ row.size }}</span>
            </div>
          </div>
        </template>
        <template #customer-data="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-100">{{ row.customer_name }}</span>
            <span class="text-xs text-gray-400">{{ row.phone }}</span>
          </div>
        </template>
        <template #workflow-data="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-gray-100">{{ progressSteps[row.progressIndex].label }}</span>
            <UProgress :value="row.progressPercent" color="emerald" size="xs" class="mt-2" />
          </div>
        </template>
        <template #order_date-data="{ row }">
          <span class="text-sm text-gray-200">{{ formatDate(row.created_at) }}</span>
        </template>
        <template #deadline-data="{ row }">
          <span class="text-sm text-gray-200">{{ formatDate(row.deadline) }}</span>
        </template>
        <template #remaining-data="{ row }">
          <span class="text-sm font-semibold" :class="row.overdue ? 'text-rose-300' : 'text-emerald-300'">
            {{ row.timeLeftLabel }}
          </span>
        </template>
        <template #cargo-data="{ row }">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-gray-100">{{ row.shipment?.cargo_code ?? 'Bekleniyor' }}</span>
            <UButton
              v-if="row.shipment?.cargo_code"
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-lucide-external-link"
              :to="dhlTrackingUrl(row.shipment.cargo_code)"
              target="_blank"
            >
              Takip Et
            </UButton>
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { downloadCSV, toCSV } from '~/composables/useCsv'

type OrderRow = {
  id: string
  customer_name: string
  phone: string
  product_name: string
  product_image: string
  frame_color: string
  size: string
  notes: string | null
  total_price: number
  current_stage: number
  planned_start: string
  deadline: string
  created_at: string
}

type ShipmentRow = {
  order_id: string
  cargo_code: string
  status: string
  shipped_at: string | null
  delivered_at: string | null
  payment_status: string
}

const { data: ordersData } = await useAsyncData<OrderRow[]>('orders:list', () => $fetch('/api/orders'))
const { data: shipmentsData } = await useAsyncData<ShipmentRow[]>('orders:shipments', () => $fetch('/api/shipments'))

const progressSteps = [
  { label: 'Sipariş alındı', short: 'Alındı' },
  { label: 'Üretime başlandı', short: 'Üretim' },
  { label: 'Çerçeve tamamlandı', short: 'Çerçeve' },
  { label: 'Paketlendi', short: 'Paket' },
  { label: 'Kargoya verildi', short: 'Kargo' },
  { label: 'Teslim edildi', short: 'Teslim' }
] as const

const stageToProgressIndex: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 4,
  7: 5
}

const shipmentsMap = computed(() => {
  const map = new Map<string, ShipmentRow>()
  for (const shipment of shipmentsData.value ?? []) {
    map.set(shipment.order_id, shipment)
  }
  return map
})

const enrichedOrders = computed(() => {
  const now = Date.now()
  return (ordersData.value ?? []).map(order => {
    const shipment = shipmentsMap.value.get(order.id)
    const deadlineTime = new Date(order.deadline).getTime()
    const diffMs = deadlineTime - now
    const overdue = diffMs < 0
    const daysLeft = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
    const timeLeftLabel = overdue ? `-${daysLeft} gün` : daysLeft === 0 ? 'Bugün' : `${daysLeft} gün`

    const progressIndex = stageToProgressIndex[order.current_stage] ?? 0
    const progressPercent = ((progressIndex + 1) / progressSteps.length) * 100

    return {
      ...order,
      shipment: shipment ?? null,
      overdue,
      timeLeftLabel,
      progressIndex,
      progressPercent: Math.round(progressPercent),
      stageLabel: progressSteps[progressIndex]?.label ?? progressSteps[0].label
    }
  })
})

const stageFilterOptions = [
  { label: 'Tüm aşamalar', value: 'all' },
  ...progressSteps.map((step, index) => ({ label: `${index + 1}. ${step.label}`, value: String(index) }))
]

const stageFilter = ref('all')
const showDelayedOnly = ref(false)

const filteredOrders = computed(() => {
  return enrichedOrders.value.filter(order => {
    if (stageFilter.value !== 'all' && order.progressIndex !== Number(stageFilter.value)) return false
    if (showDelayedOnly.value && !order.overdue) return false
    return true
  })
})

const compactStats = computed(() => {
  const total = enrichedOrders.value.length
  const production = enrichedOrders.value.filter(order => order.progressIndex < progressSteps.length - 1).length
  const delayed = enrichedOrders.value.filter(order => order.overdue).length

  return [
    {
      label: 'Aktif Sipariş',
      value: formatNumber(total),
      hint: 'Tüm kanallar',
      icon: 'i-lucide-layout-dashboard'
    },
    {
      label: 'Üretimde',
      value: formatNumber(production),
      hint: 'Devam eden işler',
      icon: 'i-lucide-hammer'
    },
    {
      label: 'Geciken',
      value: formatNumber(delayed),
      hint: 'Acil aksiyon',
      icon: 'i-lucide-alert-circle'
    }
  ]
})

const tableColumns = [
  { key: 'product', label: 'Ürün' },
  { key: 'customer', label: 'Müşteri' },
  { key: 'workflow', label: 'İş Akışı' },
  { key: 'order_date', label: 'Sipariş Tarihi' },
  { key: 'deadline', label: 'Son Teslim' },
  { key: 'remaining', label: 'Kalan Süre' },
  { key: 'cargo', label: 'DHL Kargo' }
]

const tableUi = {
  tr: {
    base: 'border-b border-slate-800/60 hover:bg-slate-800/60 transition-colors'
  },
  th: {
    base: 'text-slate-400 uppercase tracking-[0.2em] text-xs',
    padding: 'py-3 px-4'
  },
  td: {
    base: 'py-4 px-4 text-sm text-slate-200 align-middle'
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('tr-TR').format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long'
  }).format(new Date(value))
}

function statusTone(status: string | undefined) {
  if (!status) return 'text-gray-400'
  if (status === 'Teslim Edildi') return 'text-emerald-300'
  if (status === 'Yolda') return 'text-sky-300'
  return 'text-amber-300'
}

function dhlTrackingUrl(code: string) {
  return `https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id=${encodeURIComponent(code)}`
}

function exportRows() {
  const rows = enrichedOrders.value.map(order => ({
    customer_name: order.customer_name,
    phone: order.phone,
    product_name: order.product_name,
    stage: progressSteps[order.progressIndex].label,
    created_at: formatDate(order.created_at),
    deadline: formatDate(order.deadline),
    remaining: order.timeLeftLabel,
    cargo_code: order.shipment?.cargo_code ?? '',
    cargo_status: order.shipment?.status ?? ''
  }))

  downloadCSV(
    `siparisler_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['customer_name', 'phone', 'product_name', 'stage', 'created_at', 'deadline', 'remaining', 'cargo_code', 'cargo_status'])
  )
}
</script>
