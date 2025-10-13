<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard :icon="icons.CircleDollarSign" label="Toplam Gelir" :value="formatCurrency(toplamGelir)" />
      <MetricCard :icon="icons.Warehouse" label="Toplam Gider" :value="formatCurrency(toplamGider)" />
      <MetricCard :icon="icons.BarChart3" label="Net Kâr Marjı" :value="`${marj}%`" />
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Gelir / Gider Analizi</h2>
          <p class="text-sm text-white/50">Aylık trendleri takip ederek kârlılığı izleyin.</p>
        </div>
      </div>
      <div class="mt-6 h-80">
        <VChart :option="chartOptions" autoresize />
      </div>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-white">Sipariş Bazlı Detay</h2>
          <p class="text-sm text-white/50">Her sipariş için gelir, komisyon ve brüt kâr bilgisi.</p>
        </div>
        <button
          @click="exportRows"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-500/30 transition hover:from-primary-400 hover:to-emerald-300"
        >
          <Download :size="16" /> E-Tablo
        </button>
      </div>
      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-sm text-white/70">
          <thead class="bg-white/10 text-xs text-white/50 uppercase tracking-[0.2em]">
            <tr>
              <th scope="col" class="rounded-l-xl px-6 py-3">Sipariş ID</th>
              <th scope="col" class="px-6 py-3">Gelir</th>
              <th scope="col" class="px-6 py-3">Komisyon</th>
              <th scope="col" class="rounded-r-xl px-6 py-3">Brüt Kâr</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in detailsRows"
              :key="r.order_id"
              class="border-b border-white/10 bg-white/5 transition hover:bg-white/10"
            >
              <td class="px-6 py-4 font-medium text-white">{{ r.order_id }}</td>
              <td class="px-6 py-4 text-white/80">{{ formatCurrency(r.gelir) }}</td>
              <td class="px-6 py-4 text-white/80">{{ formatCurrency(r.komisyon) }}</td>
              <td class="px-6 py-4 text-white/80">{{ formatCurrency(r.brut_kar) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Download, CircleDollarSign, Warehouse, BarChart3 } from 'lucide-vue-next'
import { useFinance } from '../stores/finance'
import { useOrders } from '../stores/orders'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import MetricCard from './MetricCard.vue'
import { toCSV, downloadCSV } from '../composables/useCsv'

use([CanvasRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent])

const icons = { CircleDollarSign, Warehouse, BarChart3 }
const finance = useFinance()
const orders = useOrders()

const toplamGelir = computed(() => finance.series.reduce((a, b) => a + b.gelir, 0))
const toplamGider = computed(() => finance.series.reduce((a, b) => a + b.gider, 0))
const net = computed(() => toplamGelir.value - toplamGider.value)
const marj = computed(() => Math.round((net.value / Math.max(1, toplamGelir.value)) * 100))

const detailsRows = computed(() =>
  orders.items.map(o => ({
    order_id: o.id,
    gelir: o.total_price,
    komisyon: Math.round(o.total_price * 0.05),
    brut_kar: Math.round(o.total_price * 0.35)
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
    data: finance.series.map(s => s.month),
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
      data: finance.series.map(s => s.gelir),
      itemStyle: { color: '#34d399' },
      lineStyle: { width: 3 },
      areaStyle: { color: 'rgba(52, 211, 153, 0.15)' }
    },
    {
      name: 'Gider',
      type: 'line',
      smooth: true,
      data: finance.series.map(s => s.gider),
      itemStyle: { color: '#f97316' },
      lineStyle: { width: 3, type: 'dashed' }
    },
    {
      name: 'Marj',
      type: 'line',
      smooth: true,
      data: finance.series.map(s => s.marj),
      itemStyle: { color: '#38bdf8' },
      lineStyle: { width: 2, opacity: 0.7 }
    }
  ]
}))

function exportRows() {
  const rows = detailsRows.value
  downloadCSV(
    `maliyet_${new Date().toISOString().slice(0, 10)}.csv`,
    toCSV(rows, ['order_id', 'gelir', 'komisyon', 'brut_kar'])
  )
}
</script>
