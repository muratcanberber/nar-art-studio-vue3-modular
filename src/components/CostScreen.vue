<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard :icon="icons.CircleDollarSign" label="Toplam Gelir" :value="formatCurrency(totalRevenue)" />
      <MetricCard :icon="icons.Warehouse" label="Toplam Gider" :value="formatCurrency(totalExpense)" />
      <MetricCard :icon="icons.BarChart3" label="Net Kar Orani" :value="`${profitMargin}%`" />
    </div>

    <section class="glass-panel p-6 shadow-xl shadow-black/20">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Gelir ve Gider Trendleri</h2>
          <p class="text-sm text-white/60">Aylik hareketleri izleyerek nakit durumunu takip edin.</p>
        </div>
      </div>
      <div class="mt-6 h-80">
        <VChart :option="chartOptions" autoresize />
      </div>
    </section>

    <section class="glass-panel p-6 shadow-xl shadow-black/20">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Siparis Bazli Finans Ozeti</h2>
          <p class="text-sm text-white/60">Gelir, platform kesintisi ve tahmini maliyet ile net kari hesaplayin.</p>
        </div>
        <button
          @click="exportOrderRows"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
        >
          <Download :size="16" /> CSV
        </button>
      </div>
      <div class="mt-5 overflow-x-auto scroll-thin">
        <table class="table-shell min-w-[720px]">
          <thead class="bg-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
            <tr>
              <th class="rounded-l-xl px-6 py-3">Siparis</th>
              <th class="px-6 py-3 text-right">Gelir</th>
              <th class="px-6 py-3 text-right">Platform Kesintisi</th>
              <th class="px-6 py-3 text-right">Tahmini Malzeme</th>
              <th class="px-6 py-3 text-right">Net Kar</th>
              <th class="rounded-r-xl px-6 py-3 text-right">Kar Orani</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in orderRows"
              :key="row.order_id"
              class="border-b border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <td class="px-6 py-4 font-medium text-white">
                <div class="flex flex-col">
                  <span>{{ row.order_id }}</span>
                  <span class="text-xs text-white/40">{{ row.product_name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right text-white/80">{{ formatCurrency(row.gelir) }}</td>
              <td class="px-6 py-4 text-right text-white/80">{{ formatCurrency(row.platform_fee) }}</td>
              <td class="px-6 py-4 text-right text-white/80">{{ formatCurrency(row.material_cost) }}</td>
              <td class="px-6 py-4 text-right font-semibold text-white">{{ formatCurrency(row.net_profit) }}</td>
              <td class="px-6 py-4 text-right text-white/80">{{ row.margin }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="glass-panel p-6 shadow-xl shadow-black/20">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Stok Maliyetleri</h2>
          <p class="text-sm text-white/60">Son alis fiyatina gore kategori bazli stok listelemesi.</p>
        </div>
        <button
          @click="exportMaterialRows"
          class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-primary-400/60 hover:text-primary-100"
        >
          <Download :size="16" /> CSV
        </button>
      </div>
      <div class="mt-5 overflow-x-auto scroll-thin">
        <table class="table-shell min-w-[680px]">
          <thead class="bg-white/10 text-xs uppercase tracking-[0.2em] text-white/50">
            <tr>
              <th class="rounded-l-xl px-6 py-3">Kategori</th>
              <th class="px-6 py-3">Urun</th>
              <th class="px-6 py-3 text-right">Stok</th>
              <th class="px-6 py-3 text-right">Birim Maliyet</th>
              <th class="px-6 py-3 text-right">Toplam Maliyet</th>
              <th class="rounded-r-xl px-6 py-3">Guncelleme</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in materialRows"
              :key="row.id"
              class="border-b border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <td class="px-6 py-4 text-white/80">{{ row.categoryName }}</td>
              <td class="px-6 py-4 font-medium text-white">{{ row.name }}</td>
              <td class="px-6 py-4 text-right text-white/80">{{ row.stock_qty }}</td>
              <td class="px-6 py-4 text-right text-white/80">{{ formatCurrency(row.unit_cost) }}</td>
              <td class="px-6 py-4 text-right text-white/80">{{ formatCurrency(row.total_cost) }}</td>
              <td class="px-6 py-4 text-xs text-white/40">{{ formatDate(row.last_updated) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="glass-panel p-6 shadow-xl shadow-black/20">
      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold text-white">Hizli Fiyat Hesaplayici</h2>
            <p class="text-sm text-white/60">
              Tuval, cerceve ve ek malzemeleri secerek baz maliyeti cikarin, istediginiz kar orani ile tavsiye edilen
              satis fiyatini gorun.
            </p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-sm text-white/60">
              Tuval
              <select
                v-model="pricingForm.canvasId"
                class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
              >
                <option value="">Seciniz</option>
                <option v-for="item in canvasOptions" :key="item.id" :value="item.id">
                  {{ item.name }} - {{ formatCurrency(item.unit_cost) }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm text-white/60">
              Cerceve
              <select
                v-model="pricingForm.frameId"
                class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
              >
                <option value="">Seciniz</option>
                <option v-for="item in frameOptions" :key="item.id" :value="item.id">
                  {{ item.name }} - {{ formatCurrency(item.unit_cost) }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm text-white/60">
              Rolyef / Ek Malzeme
              <select
                v-model="pricingForm.reliefId"
                class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
              >
                <option value="">Seciniz</option>
                <option v-for="item in reliefOptions" :key="item.id" :value="item.id">
                  {{ item.name }} - {{ formatCurrency(item.unit_cost) }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm text-white/60">
              Adet
              <input
                v-model.number="pricingForm.quantity"
                type="number"
                min="1"
                class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm text-white/60">
              Ek Maliyet (boya vb.)
              <input
                v-model.number="pricingForm.extraCost"
                type="number"
                min="0"
                step="0.5"
                class="rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2 text-sm text-white/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/60"
              />
            </label>
            <div class="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/70">
              <span>Kar Orani: <strong class="text-white">{{ pricingForm.margin }}%</strong></span>
              <input
                v-model.number="pricingForm.margin"
                type="range"
                min="10"
                max="80"
                step="5"
                class="h-1 w-full cursor-pointer accent-primary-400"
              />
            </div>
          </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 class="text-base font-semibold text-white">Hesaplama Ozeti</h3>
          <div class="mt-4 space-y-3 text-sm text-white/70">
            <div class="flex items-center justify-between">
              <span>Secilen Malzemeler</span>
              <span class="font-semibold text-white">{{ formatCurrency(breakdown.selectedCost) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Ek Maliyet</span>
              <span class="font-semibold text-white">{{ formatCurrency(pricingForm.extraCost) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Adet</span>
              <span class="font-semibold text-white">{{ pricingForm.quantity }} adet</span>
            </div>
            <div class="flex items-center justify-between border-t border-white/10 pt-3">
              <span>Toplam Maliyet</span>
              <span class="text-lg font-semibold text-white">{{ formatCurrency(breakdown.totalCost) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Bir Urun Maliyeti</span>
              <span class="font-semibold text-white">{{ formatCurrency(breakdown.unitCost) }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-white/10 pt-3">
              <span>Tavsiye Satis</span>
              <span class="text-2xl font-bold text-primary-200">{{ formatCurrency(breakdown.suggestedPrice) }}</span>
            </div>
            <span class="text-xs text-white/40">
              Not: Gercek satis fiyati Shopier komisyonu ve kargo dahil edilerek guncellenmelidir.
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Download, CircleDollarSign, Warehouse, BarChart3 } from 'lucide-vue-next'
import { useFinance } from '../stores/finance'
import { useOrders } from '../stores/orders'
import { useShipments } from '../stores/shipments'
import { useMaterials } from '../stores/materials'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import MetricCard from './MetricCard.vue'
import { toCSV, downloadCSV } from '../composables/useCsv'

use([CanvasRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent])

const icons = { CircleDollarSign, Warehouse, BarChart3 }
const financeStore = useFinance()
const ordersStore = useOrders()
const shipmentsStore = useShipments()
const materialsStore = useMaterials()

const totalRevenue = computed(() => financeStore.series.reduce((total, row) => total + row.gelir, 0))
const totalExpense = computed(() => financeStore.series.reduce((total, row) => total + row.gider, 0))
const netProfit = computed(() => totalRevenue.value - totalExpense.value)
const profitMargin = computed(() => Math.round((netProfit.value / Math.max(1, totalRevenue.value)) * 100))

const orderRows = computed(() =>
  ordersStore.items.map(order => {
    const shipment = shipmentsStore.items.find(item => item.order_id === order.id)
    const platformFee = shipment?.platform_fee ?? Math.round(order.total_price * 0.05)
    const estimatedMaterials = Math.round(order.total_price * 0.35)
    const net = order.total_price - platformFee - estimatedMaterials
    const margin = Math.max(0, Math.round((net / Math.max(1, order.total_price)) * 100))

    return {
      order_id: order.id,
      product_name: order.product_name,
      gelir: order.total_price,
      platform_fee: platformFee,
      material_cost: estimatedMaterials,
      net_profit: net,
      margin
    }
  })
)

const materialRows = computed(() =>
  materialsStore.flatItems.map(item => ({
    ...item,
    total_cost: item.unit_cost * item.stock_qty
  }))
)

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long'
  }).format(date)
}

const chartOptions = computed(() => ({
  backgroundColor: 'transparent',
  grid: { left: 50, right: 20, top: 60, bottom: 40 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    textStyle: { color: '#f8fafc' }
  },
  legend: {
    top: 10,
    textStyle: { color: '#e2e8f0' },
    inactiveColor: '#475569'
  },
  xAxis: {
    type: 'category',
    data: financeStore.series.map(s => s.month),
    axisLabel: { color: '#94a3b8' },
    axisLine: { lineStyle: { color: '#334155' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#94a3b8' },
    splitLine: { lineStyle: { color: '#1f2937' } }
  },
  series: [
    {
      name: 'Gelir',
      type: 'line',
      smooth: true,
      data: financeStore.series.map(s => s.gelir),
      itemStyle: { color: '#34d399' },
      lineStyle: { width: 3 },
      areaStyle: { color: 'rgba(52, 211, 153, 0.15)' }
    },
    {
      name: 'Gider',
      type: 'line',
      smooth: true,
      data: financeStore.series.map(s => s.gider),
      itemStyle: { color: '#f97316' },
      lineStyle: { width: 3, type: 'dashed' }
    },
    {
      name: 'Marj',
      type: 'line',
      smooth: true,
      data: financeStore.series.map(s => s.marj),
      itemStyle: { color: '#38bdf8' },
      lineStyle: { width: 2, opacity: 0.7 }
    }
  ]
}))

function exportOrderRows() {
  const rows = orderRows.value.map(row => ({
    order_id: row.order_id,
    urun: row.product_name,
    gelir: row.gelir,
    platform_kesintisi: row.platform_fee,
    malzeme: row.material_cost,
    net_kar: row.net_profit,
    kar_orani: row.margin
  }))

  downloadCSV(
    `siparis_finans_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['order_id', 'urun', 'gelir', 'platform_kesintisi', 'malzeme', 'net_kar', 'kar_orani'])
  )
}

function exportMaterialRows() {
  const rows = materialRows.value.map(row => ({
    kategori: row.categoryName,
    urun: row.name,
    stok: row.stock_qty,
    birim_maliyet: row.unit_cost,
    toplam_maliyet: row.total_cost,
    guncelleme: row.last_updated.toISOString()
  }))

  downloadCSV(
    `stok_maliyet_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['kategori', 'urun', 'stok', 'birim_maliyet', 'toplam_maliyet', 'guncelleme'])
  )
}

const pricingForm = reactive({
  canvasId: '',
  frameId: '',
  reliefId: '',
  extraCost: 0,
  quantity: 1,
  margin: 40
})

const canvasOptions = computed(() => materialsStore.categories.find(cat => cat.id === 'canvas')?.items ?? [])
const frameOptions = computed(() => materialsStore.categories.find(cat => cat.id === 'frame')?.items ?? [])
const reliefOptions = computed(() => materialsStore.categories.find(cat => cat.id === 'relief')?.items ?? [])

const breakdown = computed(() => {
  const canvas = canvasOptions.value.find(item => item.id === pricingForm.canvasId)
  const frame = frameOptions.value.find(item => item.id === pricingForm.frameId)
  const relief = reliefOptions.value.find(item => item.id === pricingForm.reliefId)

  const selectedCost = (canvas?.unit_cost ?? 0) + (frame?.unit_cost ?? 0) + (relief?.unit_cost ?? 0)
  const baseCost = selectedCost + pricingForm.extraCost
  const unitCost = baseCost
  const totalCost = unitCost * Math.max(1, pricingForm.quantity)
  const suggestedPrice = Math.round(totalCost * (1 + pricingForm.margin / 100))

  return {
    selectedCost,
    unitCost,
    totalCost,
    suggestedPrice
  }
})
</script>
