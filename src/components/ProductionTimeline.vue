<template>
  <div class="space-y-6">
    <section class="glass-panel flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-white">Yapım Süreci</h2>
        <p class="text-sm text-white/60">
          Siparişlerin planlamadan kargoya teslimine kadar olan sürecini haftalık ve aylık görünümde izleyin.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          @click="viewMode = option.value"
          :class="[
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            viewMode === option.value
              ? 'bg-gradient-to-r from-primary-500 to-emerald-400 text-slate-900 shadow-lg shadow-primary-500/40'
              : 'border border-white/15 bg-white/5 text-white/70 hover:border-primary-400/50 hover:text-white'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="glass-panel space-y-6">
      <div class="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/40">
        <span>Toplam sipariş: <strong class="text-white/80">{{ timelineRows.length }}</strong></span>
        <span>Aktif dönem: <strong class="text-white/80">{{ periodLabel }}</strong></span>
      </div>

      <div class="h-[420px]">
        <VChart :option="chartOptions" autoresize />
      </div>

      <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <header class="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span class="text-xs uppercase tracking-[0.3em] text-white/40">Durum Özeti</span>
          <div class="flex flex-wrap gap-2 text-xs">
            <span
              v-for="stage in stageLegend"
              :key="stage.label"
              class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60"
            >
              <span :style="{ backgroundColor: stage.color }" class="h-2 w-2 rounded-full"></span>
              {{ stage.label }}
            </span>
          </div>
        </header>
        <div class="grid gap-4 p-5 text-sm text-white/70 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="row in timelineRows"
            :key="row.id"
            class="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm shadow-black/10"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="text-xs uppercase tracking-[0.3em] text-white/35">Sipariş</div>
                <div class="text-base font-semibold text-white">{{ row.id }}</div>
              </div>
              <span
                class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70"
                :style="{ borderColor: row.color + '90', color: '#fff' }"
              >
                {{ row.stageLabel }}
              </span>
            </div>
            <div class="mt-3 space-y-1 text-xs text-white/50">
              <div>Ürün: <span class="text-white/80">{{ row.product_name }}</span></div>
              <div>Planlanan başlangıç: {{ formatDate(row.start) }}</div>
              <div>Hedef kargo: {{ formatDate(row.end) }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components'
import { useOrders } from '../stores/orders'

use([CanvasRenderer, CustomChart, GridComponent, TooltipComponent, DataZoomComponent])

type ViewMode = 'weekly' | 'monthly'

const ordersStore = useOrders()
const viewMode = ref<ViewMode>('weekly')

const viewOptions = [
  { label: 'Haftalık', value: 'weekly' as ViewMode },
  { label: 'Aylık', value: 'monthly' as ViewMode }
]

const stageColors: Record<number, string> = {
  1: '#34d399',
  2: '#38bdf8',
  3: '#a78bfa',
  4: '#f97316',
  5: '#facc15',
  6: '#f472b6',
  7: '#22d3ee'
}

const stageLabels = [
  'Planlama',
  'Hazırlık',
  'Üretim',
  'Çerçeve Montaj',
  'Paketleme',
  'Kargoya Teslim',
  'Teslim'
]

const dayMs = 24 * 60 * 60 * 1000

const period = computed(() => {
  const now = new Date()
  if (viewMode.value === 'weekly') {
    const start = new Date(now)
    const day = start.getDay()
    const diff = (day === 0 ? -6 : 1 - day)
    start.setDate(start.getDate() + diff)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start.getTime() + 7 * dayMs)
    return { start, end }
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start, end }
})

const timelineRows = computed(() => {
  const { start, end } = period.value
  return ordersStore.items
    .map(order => {
      const taskStart = order.planned_start < start ? start : order.planned_start
      const taskEnd = order.deadline > end ? end : order.deadline
      const color = stageColors[order.current_stage] ?? '#94a3b8'
      return {
        id: order.id,
        product_name: order.product_name,
        stageLabel: stageLabels[order.current_stage - 1] ?? 'Planlama',
        start: taskStart,
        end: taskEnd,
        rawStart: order.planned_start,
        rawEnd: order.deadline,
        color
      }
    })
    .sort((a, b) => a.rawStart.getTime() - b.rawStart.getTime())
})

const periodLabel = computed(() => {
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long'
  })
  return `${formatter.format(period.value.start)} – ${formatter.format(new Date(period.value.end.getTime() - dayMs))}`
})

const renderGanttBar = (params: any, api: any) => {
  const categoryIndex = api.value(0)
  const startCoord = api.coord([api.value(1), categoryIndex])
  const endCoord = api.coord([api.value(2), categoryIndex])
  const barHeight = 26
  const rectShape = {
    x: startCoord[0],
    y: startCoord[1] - barHeight / 2,
    width: endCoord[0] - startCoord[0],
    height: barHeight
  }

  return {
    type: 'rect',
    shape: rectShape,
    style: api.style({
      fill: params.data.itemStyle?.color ?? '#94a3b8',
      opacity: 0.85,
      stroke: '#0f172a',
      lineWidth: 1
    })
  }
}

const chartOptions = computed(() => {
  const categories = timelineRows.value.map(item => item.id)
  const data = timelineRows.value.map((row, index) => ({
    value: [index, row.start.getTime(), row.end.getTime()],
    itemStyle: { color: row.color },
    stage: row.stageLabel,
    product: row.product_name,
    start: row.start,
    end: row.end
  }))

  return {
    backgroundColor: 'transparent',
    grid: { left: 120, right: 40, top: 40, bottom: 60 },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const start = new Date(params.data.start)
        const end = new Date(params.data.end)
        const formatter = new Intl.DateTimeFormat('tr-TR', {
          day: '2-digit',
          month: 'long'
        })
        return `
          <div class="text-xs">
            <div><strong>${params.data.product}</strong></div>
            <div>Başlangıç: ${formatter.format(start)}</div>
            <div>Bitiş: ${formatter.format(end)}</div>
            <div>Aşama: ${params.data.stage}</div>
          </div>
        `
      }
    },
    dataZoom: viewMode.value === 'monthly'
      ? [{ type: 'slider', show: true, bottom: 10, height: 12 }]
      : [],
    xAxis: {
      type: 'time',
      min: period.value.start.getTime(),
      max: period.value.end.getTime(),
      axisLabel: {
        color: '#94a3b8',
        formatter: (value: number) =>
          new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(value))
      },
      axisLine: { lineStyle: { color: '#1f2937' } },
      splitLine: { lineStyle: { color: '#1f2937' } }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#cbd5f5', fontWeight: '600' },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'custom',
        renderItem: renderGanttBar,
        itemStyle: {
          opacity: 0.85
        },
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => params.data.stage,
          color: '#e2e8f0',
          fontSize: 11,
          fontWeight: 600
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data
      }
    ]
  }
})

const stageLegend = computed(() =>
  Object.entries(stageColors).map(([key, color]) => ({
    label: stageLabels[Number(key) - 1],
    color
  }))
)

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long'
  }).format(value)
}
</script>
